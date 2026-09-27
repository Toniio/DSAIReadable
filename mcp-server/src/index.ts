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

/** Server version comes from the generated metadata, never hardcoded. */
const mcpServerVersion = (() => {
  try {
    return (
      loadContext<{ mcp_server_version?: string }>("ds-metadata.json")
        .mcp_server_version ?? "0.0.0"
    )
  } catch {
    return "0.0.0"
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
          message: `Origin "${origin}" is not allowed. Set MCP_ALLOWED_ORIGINS to authorise it.`,
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

      // Existing session
      const existing = sessionId ? sessions.get(sessionId) : undefined
      if (existing) {
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

      // New session (initialize request)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      })

      transport.onclose = () => {
        const sid = (transport as unknown as { _sessionId?: string })._sessionId
        if (sid) sessions.delete(sid)
      }

      const server = createMcpServer()
      await server.connect(transport)
      await transport.handleRequest(req, res)

      // Store session after handling (session ID is set by handleRequest)
      const newId = (transport as unknown as { sessionId?: string }).sessionId
      if (newId) {
        sessions.set(newId, { transport, lastSeen: Date.now() })
      }
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
