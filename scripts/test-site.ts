/**
 * Crawls the built documentation site in headless Chromium and fails on what
 * a visitor, or a keyboard, would hit.
 *
 * It serves `site/out` itself, under the base path the build was made with
 * (read from the built pages: `SITE_BASE_PATH=/DSAIReadable` for the site
 * GitHub Pages serves), then loads, in the light theme and in the dark one:
 *   - every page of the site;
 *   - the preview canvas of every component, in its story view and in its
 *     example view, and the example of every pattern and foundation: the
 *     documents the pages show in iframes, which axe does not enter from a page.
 * and checks each load for:
 *   - an axe violation on the WCAG 2.x A and AA rules, 2.2 AA included;
 *   - a page error, a console error, or a response of 400 and above that is
 *     not one of `KNOWN_404`;
 *   - the theme: the `.dark` class is on `<html>` when, and only when, the
 *     dark theme was asked for;
 *   - the keyboard: Tab from the top of the document to its end, and every tab
 *     stop must be displayed and carry a focus indicator with a part at 3:1
 *     against what it is drawn on (focus.md, rule 6; the measure is
 *     tests/focus-measure.ts, the one the component tests run). The walk
 *     crosses every stop of every load, but measures an indicator once per
 *     distinct element (tag, classes, role, and the color under it) and theme:
 *     the same classes on the same surface paint the same ring.
 *
 *   npm run site:build       (with the SITE_BASE_PATH of the deployment)
 *   npm run site:test
 *   npm run site:test -- --only=components/button --concurrency=2
 */

import { createServer } from "node:http"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, join, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import axe from "axe-core"
import { chromium, type Browser } from "playwright"
import ts from "typescript"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, "site/out")

const args = process.argv.slice(2)
const flag = (name: string) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1]
const ONLY = flag("only")
const CONCURRENCY = Number(flag("concurrency") ?? 4)

/**
 * Responses of 404 the examples of the specs cause on purpose: each is a
 * reference an example makes to a file or a page of the project that uses it
 * (an avatar picture, a "Forgot your password?" page), which next/link
 * prefetches or the browser requests. The site has none of them. Remove an
 * entry when its example stops making the reference.
 */
const KNOWN_404: { path: RegExp; why: string }[] = [
  {
    path: /\/(user1|user2)\.jpg$/,
    why: "Avatar's example shows two pictures of the project's own",
  },
  {
    path: /\/placeholder\.jpg$/,
    why: "AspectRatio's example frames a picture of the project's own",
  },
  {
    path: /\/(forgot-password|sign-up)\//,
    why: "the sign-in pattern links to the project's recovery and sign-up pages",
  },
  {
    path: /\/(projects|settings)\/$/,
    why: "the navigation pattern links to the project's own pages",
  },
]

/**
 * Tab stops whose focus indicator is under 3:1 or missing, in the components
 * themselves: the crawl found them, and changing a component is a change of
 * the design system, not of the site. Each entry says what is measured; remove
 * it when the component draws a solid part at 3:1.
 */
const KNOWN_FOCUS_GAPS: { page: RegExp; stop: RegExp; why: string }[] = [
  {
    page: /^\/preview\/components\/(context-menu|dropdown-menu|menubar)\//,
    stop: /\[role=menu(item)?\]$/,
    why: "an open menu takes focus on itself with no ring and marks the active item with a fill (focus:bg-accent), as shadcn/ui draws it",
  },
  {
    page: /^\/preview\/components\/sonner\//,
    stop: /^li$/,
    why: "a toast takes focus with sonner's own 2px shadow at 20%, about 1.5:1",
  },
]

/**
 * The component tests' stylesheet with no animation and no transition: axe and
 * the focus measure read the end state, not a color halfway through a ring's
 * transition.
 */
const NO_MOTION = readFileSync(join(ROOT, "tests/no-motion.css"), "utf-8")

/** The WCAG 2.x A and AA rules, 2.2 AA included: the design system's target. */
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

/** The most tab stops one load may have: past it, the walk reports a trap. */
const MAX_STOPS = 600

type Theme = "light" | "dark"

type Kind = "page" | "preview-story" | "preview-example" | "missing"

interface Target {
  kind: Kind
  theme: Theme
  /** The path under the base path, with its hash for a preview. */
  url: string
}

// ── The server ───────────────────────────────────────────────────────────

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".map": "application/json",
}

/** The base path of the build: what its pages put before `/_next/`. */
function basePathOf(): string {
  if (!existsSync(join(OUT, "index.html")))
    throw new Error(
      "site/out has no index.html: run `npm run site:build` first (with the SITE_BASE_PATH of the deployment)."
    )
  const html = readFileSync(join(OUT, "index.html"), "utf-8")
  const match = /(?:href|src)="([^"]*)\/_next\//.exec(html)
  if (!match) throw new Error("site/out/index.html has no /_next/ asset.")
  return match[1]
}

/**
 * A static host like GitHub Pages: the site under the base path, a folder
 * served as its index.html (and redirected to its trailing slash), and 404.html
 * with a 404 for anything else.
 */
function serve(base: string) {
  const server = createServer((request, response) => {
    const path = decodeURIComponent(
      new URL(request.url ?? "/", "http://x").pathname
    )
    const relative =
      path === base
        ? "/"
        : path.startsWith(`${base}/`)
          ? path.slice(base.length)
          : null
    let file = relative === null ? null : resolve(OUT, `.${relative}`)
    if (file && !file.startsWith(OUT + sep) && file !== OUT) file = null
    if (file && existsSync(file) && statSync(file).isDirectory()) {
      if (!path.endsWith("/")) {
        response.writeHead(301, { location: `${path}/` }).end()
        return
      }
      file = join(file, "index.html")
    }
    if (file && existsSync(file) && statSync(file).isFile()) {
      response
        .writeHead(200, {
          "content-type": TYPES[extname(file)] ?? "application/octet-stream",
        })
        .end(readFileSync(file))
      return
    }
    response
      .writeHead(404, { "content-type": TYPES[".html"] })
      .end(readFileSync(join(OUT, "404.html")))
  })
  return new Promise<{ origin: string; close: () => Promise<void> }>((done) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      const port = typeof address === "object" && address ? address.port : 0
      done({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((end) => server.close(() => end())),
      })
    })
  })
}

// ── What to load ─────────────────────────────────────────────────────────

/** The routes of the export: every folder with an index.html. */
function routes(dir = OUT, prefix = ""): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      // The 404 page is loaded by its own target, with the status it answers.
      if (entry === "_next" || entry === "_not-found" || entry === "404")
        continue
      found.push(...routes(full, `${prefix}/${entry}`))
    } else if (entry === "index.html") found.push(`${prefix}/`)
  }
  return found
}

/** The hash a preview canvas reads its state from (site/playground/protocol.ts). */
const frameState = (view: "story" | "example", theme: Theme) =>
  `#${encodeURIComponent(JSON.stringify({ view, args: {}, state: "rest", theme }))}`

function targets(): Target[] {
  const out: Target[] = []
  for (const route of routes().filter((r) => !ONLY || r.includes(ONLY))) {
    for (const theme of ["light", "dark"] as const) {
      if (route.startsWith("/preview/components/")) {
        out.push({
          kind: "preview-story",
          theme,
          url: route + frameState("story", theme),
        })
        out.push({
          kind: "preview-example",
          theme,
          url: route + frameState("example", theme),
        })
      } else if (route.startsWith("/preview/")) {
        out.push({
          kind: "preview-example",
          theme,
          url: route + frameState("example", theme),
        })
      } else out.push({ kind: "page", theme, url: route })
    }
  }
  if (!ONLY)
    for (const theme of ["light", "dark"] as const)
      out.push({ kind: "missing", theme, url: "/this-page-does-not-exist/" })
  return out
}

// ── The page side of the keyboard walk ───────────────────────────────────

/**
 * tests/focus-measure.ts compiled for the page: it holds no import, so
 * TypeScript's own transpiler is all it needs, and the component tests and
 * this crawl measure a focus indicator with the same code.
 */
const MEASURE = ts.transpileModule(
  readFileSync(join(ROOT, "tests/focus-measure.ts"), "utf-8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }
).outputText

/**
 * `window.__walk`: the tab stops of a document, one `peek` after each Tab
 * press. A stop's indicator is measured as the component tests do, between
 * the document with the previous stop focused and the document with this one
 * focused; the previous stop is focused again from script to take the first.
 */
const WALK = `
${`window.__focus = (() => { const exports = {}; ${MEASURE}\n return exports })()`};
window.__walk = {
  seen: new Set(), frames: 0, prev: null, current: null,
  peek() {
    const M = window.__focus
    const focused = document.activeElement
    if (!focused || focused === document.body || focused === document.documentElement)
      return { end: true }
    // A preview in an iframe: Tab walks through its own stops, which its
    // canvas has as a document of its own. A Radix focus guard is no stop
    // either: it hands focus to the modal it stands next to.
    if (focused.tagName === "IFRAME" || focused.hasAttribute("data-radix-focus-guard"))
      return { end: false, frame: true }
    if (this.seen.has(focused)) return { end: true }
    this.prev = this.current
    this.current = focused
    this.seen.add(focused)
    return {
      end: false,
      frame: false,
      label: M.describeElement(focused),
      signature: [
        focused.tagName,
        focused.getAttribute("class"),
        focused.getAttribute("role"),
        M.backdrop(focused).join(","),
      ].join("|"),
      // Hidden from the page, not merely drawn with no box of its own: a
      // choice input behind its card is a stop, and its card shows the ring.
      shown: focused.checkVisibility({ visibilityProperty: true }),
    }
  },
  async measure() {
    const M = window.__focus
    const next = () => new Promise(requestAnimationFrame)
    const focused = this.current
    await next()
    const after = M.snapshot()
    if (this.prev && this.prev.isConnected) this.prev.focus({ preventScroll: true })
    else focused.blur()
    await next()
    // A modal keeps focus on its first stop: there is no document without it.
    if (document.activeElement === focused) return { trapped: true }
    const before = M.snapshot()
    focused.focus({ preventScroll: true })
    await next()
    return { shown: M.indicatorContrast(focused, before, after), min: M.MIN_CONTRAST }
  },
}
`

interface Stop {
  end: boolean
  frame?: boolean
  label?: string
  signature?: string
  shown?: boolean
}

// ── One load ─────────────────────────────────────────────────────────────

/** Indicators measured so far, by theme and element: each is measured once. */
const measured = new Set<string>()
let stopsWalked = 0
/** Stops in an open modal, whose focus cannot be taken off them to measure. */
let unmeasured = 0

async function check(
  browser: Browser,
  origin: string,
  base: string,
  target: Target
): Promise<string[]> {
  const problems: string[] = []
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    // The overlays and the loops of the design system stop: axe reads final colors.
    reducedMotion: "reduce",
  })
  // next-themes reads the theme from here before the first paint.
  await context.addInitScript((theme) => {
    try {
      localStorage.setItem("theme", theme)
    } catch {
      // A page with no storage keeps the theme it was given at load.
    }
  }, target.theme)
  const page = await context.newPage()
  try {
    page.on("pageerror", (error) =>
      problems.push(`page error: ${error.message.slice(0, 200)}`)
    )
    page.on("console", (message) => {
      // A failed request is reported once, by its response below.
      if (
        message.type() === "error" &&
        !/^Failed to load resource/.test(message.text())
      )
        problems.push(`console error: ${message.text().slice(0, 200)}`)
    })
    page.on("response", (response) => {
      const status = response.status()
      const path = new URL(response.url()).pathname
      const expected =
        target.kind === "missing" && path === `${base}${target.url}`
      if (status < 400 || expected) return
      if (KNOWN_404.some((known) => status === 404 && known.path.test(path)))
        return
      problems.push(`HTTP ${status}: ${path}`)
    })
    page.on("requestfailed", (request) => {
      // Next cancels the prefetches and preloads a navigation makes useless.
      if (request.failure()?.errorText === "net::ERR_ABORTED") return
      problems.push(
        `request failed: ${new URL(request.url()).pathname} (${request.failure()?.errorText})`
      )
    })

    const response = await page.goto(`${origin}${base}${target.url}`, {
      waitUntil: "networkidle",
      timeout: 60_000,
    })
    const status = response?.status()
    const wanted = target.kind === "missing" ? 404 : 200
    if (status !== wanted)
      problems.push(`the page answers ${status}, not ${wanted}`)
    await page.addStyleTag({ content: NO_MOTION })
    await page.evaluate("document.fonts.ready.then(() => 0)")
    // Two frames and a beat: the story of a preview renders after its module loads.
    await page.waitForTimeout(250)

    const dark = await page.evaluate<boolean>(
      "document.documentElement.classList.contains('dark')"
    )
    if (dark !== (target.theme === "dark"))
      problems.push(`the ${target.theme} theme was not applied`)

    // Accessibility.
    await page.addScriptTag({ content: axe.source })
    const violations = await page.evaluate<
      {
        id: string
        impact: string | null
        help: string
        nodes: number
        target: string
      }[]
    >(
      `window.axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(AXE_TAGS)} } }).then((result) => result.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, target: v.nodes[0].target.join(" ") })))`
    )
    for (const v of violations)
      problems.push(
        `axe ${v.id} (${v.impact}, ${v.nodes} node${v.nodes === 1 ? "" : "s"}): ${v.help}. First: ${v.target}`
      )

    // The keyboard. A page walks its own stops: what its iframes hold is a
    // preview, which is loaded and walked as a document of its own below.
    await page.evaluate(
      "document.querySelectorAll('iframe').forEach((frame) => { frame.tabIndex = -1 })"
    )
    await page.addScriptTag({ content: WALK })
    let end = false
    for (let i = 0; i < MAX_STOPS && !end; i++) {
      await page.keyboard.press("Tab")
      const stop = await page.evaluate<Stop>("window.__walk.peek()")
      if (stop.end) end = true
      if (stop.end || stop.frame) continue
      stopsWalked++
      if (!stop.shown)
        problems.push(
          `tab stop ${stop.label} is focused but hidden (display or visibility)`
        )
      const key = `${target.theme}|${stop.signature ?? stop.label}`
      if (measured.has(key)) continue
      const result = await page.evaluate<{
        shown?: number
        min?: number
        trapped?: boolean
      }>("window.__walk.measure()")
      if (result.trapped) {
        unmeasured++
        continue
      }
      measured.add(key)
      const { shown = 0, min = 3 } = result
      if (shown >= min) continue
      const route = target.url.split("#")[0]
      if (
        KNOWN_FOCUS_GAPS.some(
          (known) => known.page.test(route) && known.stop.test(stop.label ?? "")
        )
      )
        continue
      problems.push(
        `tab stop ${stop.label} (${(stop.signature ?? "").split("|")[1] || "no class"}): focus indicator at ${shown.toFixed(2)}:1, under ${min}:1 or with no solid part`
      )
    }
    if (!end)
      problems.push(`the Tab walk did not end within ${MAX_STOPS} stops`)
  } catch (error) {
    problems.push(`crawl: ${String(error).slice(0, 300)}`)
  } finally {
    await context.close()
  }
  return problems
}

// ── Run ──────────────────────────────────────────────────────────────────

const base = basePathOf()
const all = targets()
const { origin, close } = await serve(base)
const browser = await chromium.launch()
console.log(
  `site:test: ${all.length} loads of site/out under "${base || "/"}", ${CONCURRENCY} at a time, at ${origin}`
)

const failures: { target: Target; problems: string[] }[] = []
let next = 0
let done = 0
async function worker() {
  while (next < all.length) {
    const target = all[next++]
    const problems = await check(browser, origin, base, target)
    if (problems.length > 0) failures.push({ target, problems })
    if (++done % 50 === 0) console.log(`  ${done}/${all.length}`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
await browser.close()
await close()

for (const { target, problems } of failures.sort((a, b) =>
  a.target.url.localeCompare(b.target.url)
)) {
  console.error(
    `\n✖ ${target.kind} ${target.theme} ${base}${target.url.split("#")[0]}`
  )
  for (const problem of problems.slice(0, 12)) console.error(`    ${problem}`)
  if (problems.length > 12) console.error(`    … ${problems.length - 12} more`)
}

if (failures.length > 0) {
  console.error(
    `\n❌ site:test: ${failures.length} of ${all.length} loads have a problem.`
  )
  process.exit(1)
}
console.log(
  `✅ site:test: ${all.length} loads (light and dark), no axe violation, page error or unexpected response; ${stopsWalked} tab stops walked, ${measured.size} focus indicators measured, ${unmeasured} stops in an open modal left unmeasured.`
)
