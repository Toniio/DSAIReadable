#!/usr/bin/env tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { createServer } from "node:http"
import { registerDsCoreTools } from "./tools/ds-core.js"
import { registerDatavizTools } from "./tools/dataviz.js"
import { registerUxWritingTools } from "./tools/ux-writing.js"
import { registerAdminTools } from "./tools/admin.js"
import { registerPrompts } from "./prompts/index.js"
import { registerResources } from "./resources/index.js"
import { loadContext } from "./lib/context.js"

/**
 * Server version comes from the generated metadata, never hardcoded. Without
 * a cache it is "unknown": a made-up zero version would read as a real one.
 */
const mcpServerVersion = (() => {
  try {
    return (
      loadContext<{ mcp_server_version?: string }>("ds-metadata.json")
        .mcp_server_version ?? "unknown"
    )
  } catch {
    return "unknown"
  }
})()

const mode = process.argv.includes("--http") ? "http" : "stdio"
const port = parseInt(process.env.PORT ?? process.env.MCP_PORT ?? "3100", 10)
// Bind to loopback by default: an unauthenticated local MCP server must not be
// reachable from the network. Override with MCP_HOST only when deliberate.
const host = process.env.MCP_HOST ?? "127.0.0.1"

const DEFAULT_ALLOWED_ORIGINS = [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]

const allowedOrigins = new Set(
  process.env.MCP_ALLOWED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? DEFAULT_ALLOWED_ORIGINS
)

// Idle sessions are evicted so a long-running server cannot grow without bound.
const SESSION_TTL_MS = parseInt(process.env.MCP_SESSION_TTL_MS ?? "1800000", 10) // 30 min
const MAX_SESSIONS = parseInt(process.env.MCP_MAX_SESSIONS ?? "100", 10)

function serverDescription(): string {
  try {
    const components = loadContext<unknown[]>("components.json")
    const variables = loadContext<unknown[]>("variables.json")
    const primitives = loadContext<unknown[]>("primitives.json")
    const tokenCount =
      (Array.isArray(variables) ? variables.length : 0) +
      (Array.isArray(primitives) ? primitives.length : 0)
    const componentCount = Array.isArray(components) ? components.length : 0
    return `MCP Server for the DSAIReadable Design System — ${componentCount} components, ${tokenCount} tokens`
  } catch {
    return "MCP Server for the DSAIReadable Design System"
  }
}

function createMcpServer() {
  const server = new McpServer({
    name: "DSAIReadable",
    version: mcpServerVersion,
    description: serverDescription(),
  })

  registerDsCoreTools(server)
  registerDatavizTools(server)
  registerUxWritingTools(server)
  registerAdminTools(server)
  registerPrompts(server)
  registerResources(server)

  return server
}

if (mode === "http") {
  // Session management: keep transport instances alive across requests
  const sessions = new Map<
    string,
    { transport: StreamableHTTPServerTransport; lastSeen: number }
  >()

  function sweepSessions(): void {
    const now = Date.now()
    for (const [sid, entry] of sessions) {
      if (now - entry.lastSeen > SESSION_TTL_MS) {
        sessions.delete(sid)
        void entry.transport.close?.()
      }
    }
  }

  const sweeper = setInterval(sweepSessions, 60_000)
  sweeper.unref?.()

  const httpServer = createServer(async (req, res) => {
    const origin = req.headers.origin

    // MCP spec: servers MUST validate the Origin header to prevent DNS
    // rebinding attacks. A same-origin/non-browser client sends no Origin.
    if (origin !== undefined && !allowedOrigins.has(origin)) {
      res.writeHead(403, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          error: "Forbidden origin",
          message: `Origin "${origin}" is not allowed. Set MCP_ALLOWED_ORIGINS to authorize it.`,
        })
      )
      return
    }

    if (origin !== undefined) {
      res.setHeader("Access-Control-Allow-Origin", origin)
      res.setHeader("Vary", "Origin")
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Authorization, Mcp-Session-Id"
    )
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id")

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? "/", `http://${host}:${port}`)

    if (url.pathname === "/mcp") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined

      if (sessionId !== undefined) {
        // A session idle past its TTL is expired now, not at the next sweep:
        // served, it would come back to life with a fresh lastSeen.
        sweepSessions()
        const existing = sessions.get(sessionId)
        if (!existing) {
          // Unknown, expired or closed. The spec answers 404, the signal for
          // the client to initialize a new session.
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32001,
                message:
                  "Session not found or expired. Send a new initialize request, without an Mcp-Session-Id header.",
              },
              id: null,
            })
          )
          return
        }
        existing.lastSeen = Date.now()
        await existing.transport.handleRequest(req, res)
        return
      }

      sweepSessions()
      if (sessions.size >= MAX_SESSIONS) {
        res.writeHead(503, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            error: "Too many sessions",
            message: `Session limit of ${MAX_SESSIONS} reached. Retry later or raise MCP_MAX_SESSIONS.`,
          })
        )
        return
      }

      // New session (initialize request). Only the SDK's public API is used:
      // the session is stored once initialized and dropped when the transport
      // closes (DELETE from the client, or eviction by the sweep).
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (sid) => {
          sessions.set(sid, { transport, lastSeen: Date.now() })
        },
      })

      transport.onclose = () => {
        if (transport.sessionId) sessions.delete(transport.sessionId)
      }

      const server = createMcpServer()
      await server.connect(transport)
      await transport.handleRequest(req, res)
    } else if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          status: "ok",
          name: "DSAIReadable",
          version: mcpServerVersion,
          sessions: sessions.size,
        })
      )
    } else {
      res.writeHead(404)
      res.end("Not Found — use /mcp or /health")
    }
  })

  httpServer.listen(port, host, () => {
    console.log(
      `🚀 DSAIReadable MCP Server (HTTP) listening on http://${host}:${port}/mcp`
    )
    console.log(`   Health check: http://${host}:${port}/health`)
    console.log(`   Allowed origins: ${[...allowedOrigins].join(", ")}`)
  })
} else {
  const server = createMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
