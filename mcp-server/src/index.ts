#!/usr/bin/env node
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server"
import { serveStdio } from "@modelcontextprotocol/server/stdio"
import { toNodeHandler } from "@modelcontextprotocol/node"
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

/**
 * Every answer comes from the context cache, compiled before the server
 * starts and the same for every client: lists and resources can be cached
 * for an hour, by shared caches too (2026-07-28 revision, ttlMs/cacheScope).
 */
const CACHE_HINT = { ttlMs: 3_600_000, cacheScope: "public" } as const

function createMcpServer() {
  const server = new McpServer(
    {
      name: "DSAIReadable",
      version: mcpServerVersion,
      description: serverDescription(),
    },
    {
      cacheHints: {
        "server/discover": CACHE_HINT,
        "tools/list": CACHE_HINT,
        "prompts/list": CACHE_HINT,
        "resources/list": CACHE_HINT,
        "resources/templates/list": CACHE_HINT,
        "resources/read": CACHE_HINT,
      },
    }
  )

  registerDsCoreTools(server)
  registerDatavizTools(server)
  registerUxWritingTools(server)
  registerAdminTools(server)
  registerPrompts(server)
  registerResources(server)

  return server
}

if (mode === "http") {
  // Stateless: each request is served by a fresh instance from the factory,
  // for the 2026-07-28 revision and for 2025-era clients alike. No session is
  // kept, so there is nothing to expire or to cap.
  const mcpHandler = toNodeHandler(createMcpHandler(createMcpServer))

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
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    // The 2026-07-28 standard headers (SEP-2243) travel on every request.
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Authorization, MCP-Protocol-Version, Mcp-Method, Mcp-Name"
    )

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? "/", `http://${host}:${port}`)

    if (url.pathname === "/mcp") {
      await mcpHandler(req, res)
    } else if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          status: "ok",
          name: "DSAIReadable",
          version: mcpServerVersion,
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
  // The opening exchange of the connection picks the protocol revision:
  // 2026-07-28 (server/discover) or 2025-era (initialize).
  serveStdio(createMcpServer)
}
