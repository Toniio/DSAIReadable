/**
 * Consumer install test for the shadcn registry.
 *
 * `registry:check` proves registry.json matches the sources and
 * `shadcn registry validate` proves it matches the schema. Neither proves a
 * consumer can use it: twice, a registry that passed both shipped components
 * that did not compile once installed (a missing `@/lib/focus`, then an
 * unpinned react-day-picker that jumped a major). This installs every item
 * into a blank app, the way a consumer would, and type-checks the result.
 *
 * Compiling is not rendering: an app can build while every `sm:` is dead or
 * `bg-red-500` still works. So it also builds the app's stylesheet and checks
 * what Tailwind emitted — the lockdown, the fonts, `dark:`, the z-index and
 * animation utilities, the breakpoints.
 *
 * The app uses non-default aliases (`~/ui`, `~/lib`, `src/`) so that an import
 * the CLI fails to rewrite cannot resolve by luck.
 *
 * The first item goes into a project that already holds the stock
 * `lib/utils.ts` of shadcn/ui, with no `--overwrite` and no terminal: that is
 * the path of the README, and a file the CLI would ask about stops it there.
 *
 * The opt-in nova brand is installed in a second step, so that what a lyra
 * consumer gets is checked first: no `.nova` block and no nova font.
 *
 *   npx tsx scripts/test-registry-install.ts [--source local|github] [--keep]
 *
 *   --source local   (default) items built from this checkout by `shadcn build`
 *                    and served on 127.0.0.1; internal registryDependencies are
 *                    redirected there, so a pull request tests its own registry
 *   --source github  the published addresses, `<owner>/<repo>/<item>`, as a
 *                    consumer types them — run after a merge to main
 *   --keep           leave the temporary app on disk for inspection
 */

import { spawn } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { NOVA_FONTS, nextFontsOf } from "./lib/next-fonts.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const SOURCE = args.includes("--source")
  ? args[args.indexOf("--source") + 1]
  : "local"
const KEEP = args.includes("--keep")
if (SOURCE !== "local" && SOURCE !== "github") {
  console.error(`❌ --source must be "local" or "github", got "${SOURCE}"`)
  process.exit(1)
}

interface Registry {
  homepage: string
  items: Array<{
    name: string
    type: string
    files?: Array<{ path: string; target?: string }>
    registryDependencies?: string[]
  }>
}
const registry = JSON.parse(
  readFileSync(join(ROOT, "registry.json"), "utf-8")
) as Registry
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
const version = (name: string) =>
  pkg.dependencies[name] ?? pkg.devDependencies[name]

/** `Toniio/DSAIReadable`, read from the registry rather than repeated here. */
const repoRef = new URL(registry.homepage).pathname.replace(/^\/|\/$/g, "")
const SHADCN = join(ROOT, "node_modules/.bin/shadcn")

const THEME_NOVA = "theme-nova"
const novaItem = registry.items.find((i) => i.name === THEME_NOVA)
if (!novaItem) {
  console.error(`❌ registry.json has no ${THEME_NOVA} item`)
  process.exit(1)
}
/** theme-nova and the items only it asks for: its fonts. */
const novaOnly = new Set([
  THEME_NOVA,
  ...registry.items
    .filter(
      (i) =>
        i.type === "registry:font" &&
        novaItem.registryDependencies?.includes(`${repoRef}/${i.name}`)
    )
    .map((i) => i.name),
])

/** Run a command to completion without blocking the event loop (the local
 * registry server lives in this same process). No terminal: a prompt reads
 * the end of its input, it does not hang. */
function run(cmd: string, argv: string[], cwd: string): Promise<string> {
  return new Promise((ok, fail) => {
    const child = spawn(cmd, argv, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    })
    let out = ""
    child.stdout.on("data", (d) => (out += d))
    child.stderr.on("data", (d) => (out += d))
    child.on("error", fail)
    child.on("close", (code) =>
      code === 0
        ? ok(out)
        : fail(
            new Error(`${cmd} ${argv.slice(0, 2).join(" ")} → ${code}\n${out}`)
          )
    )
  })
}

/**
 * What `shadcn init` writes, spelled out here: read from this repository, it
 * would follow a change that makes the install prompt.
 */
const STOCK_UTILS = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`

/** Utilities the design system's components rely on: each must compile. */
const PRESENT = [
  "bg-primary",
  "bg-chart-1",
  "dark:bg-primary",
  "sm:flex",
  "data-open:flex",
  "animate-in",
  "z-modal",
  "font-mono",
  "font-sans",
  "font-body",
  "font-heading",
  "rounded-surface",
  "rounded-control",
  "rounded-item",
  "rounded-inset",
  "rounded-mark",
  "rounded-pill",
  "text-ui",
  "text-description",
  "text-title",
  "text-control",
  "rounded-lg",
  "shadow-md",
  "p-2",
  "h-9",
  "text-xs",
  "tracking-widest",
  "max-w-sm",
]
/** Tailwind defaults and CLI side effects the lockdown must remove. */
const ABSENT = [
  "bg-red-500",
  "text-slate-900",
  "shadow-2xs",
  "bg-color-primary",
  "bg-ds-prim-color-white",
  "p-13",
  "text-7xl",
  "font-serif",
  "tracking-tighter",
]

const work = mkdtempSync(join(tmpdir(), "dsaireadable-registry-"))
const app = join(work, "app")
const failures: string[] = []
let server: ReturnType<typeof createServer> | undefined

try {
  // -------------------------------------------------------------------------
  // 1. Where the items come from
  // -------------------------------------------------------------------------
  let addressOf = (item: string) => `${repoRef}/${item}`

  if (SOURCE === "local") {
    const built = join(work, "r")
    await run(SHADCN, ["build", "./registry.json", "-o", built], ROOT)
    const selfRef = new RegExp(`^${repoRef}/(.+)$`)
    server = createServer((req, res) => {
      const file = join(built, (req.url ?? "").replace(/^\/r\//, ""))
      if (!existsSync(file)) return void res.writeHead(404).end()
      const item = JSON.parse(readFileSync(file, "utf-8")) as {
        registryDependencies?: string[]
      }
      item.registryDependencies = item.registryDependencies?.map((d) =>
        d.replace(selfRef, (_, name: string) => `${base}${name}.json`)
      )
      res
        .writeHead(200, { "content-type": "application/json" })
        .end(JSON.stringify(item))
    })
    await new Promise<void>((ok) => server!.listen(0, "127.0.0.1", ok))
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/r/`
    addressOf = (item) => `${base}${item}.json`
  }

  // -------------------------------------------------------------------------
  // 2. A blank consumer app, on the same React/Tailwind/TS ranges as ours
  // -------------------------------------------------------------------------
  mkdirSync(join(app, "src"), { recursive: true })
  const json = (file: string, data: unknown) =>
    writeFileSync(join(app, file), JSON.stringify(data, null, 2))
  json("package.json", {
    name: "registry-consumer",
    private: true,
    type: "module",
    dependencies: Object.fromEntries(
      ["react", "react-dom", "tailwindcss"].map((n) => [n, version(n)])
    ),
    devDependencies: {
      ...Object.fromEntries(
        ["typescript", "@types/react", "@types/react-dom"].map((n) => [
          n,
          version(n),
        ])
      ),
      // Released in lockstep with tailwindcss, so the same range applies.
      "@tailwindcss/cli": version("tailwindcss"),
    },
  })
  json("tsconfig.json", {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      paths: { "~/*": ["./src/*"] },
    },
    include: ["src"],
  })
  json("components.json", {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: false,
    tsx: true,
    tailwind: {
      config: "",
      css: "src/app.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    iconLibrary: "phosphor",
    aliases: {
      components: "~/components",
      ui: "~/ui",
      lib: "~/lib",
      utils: "~/lib/utils",
      hooks: "~/hooks",
    },
  })
  writeFileSync(join(app, "src/app.css"), '@import "tailwindcss";\n')
  await run(
    "npm",
    ["install", "--no-audit", "--no-fund", "--loglevel=error"],
    app
  )

  // -------------------------------------------------------------------------
  // 3. One component into a project that holds the stock lib/utils.ts
  // -------------------------------------------------------------------------
  mkdirSync(join(app, "src/lib"))
  writeFileSync(join(app, "src/lib/utils.ts"), STOCK_UTILS)
  const stockInstall = await run(SHADCN, ["add", addressOf("button")], app)
  if (/already exists|would you like/i.test(stockInstall))
    failures.push(
      `installing over the stock lib/utils.ts prompts:\n${stockInstall}`
    )
  if (readFileSync(join(app, "src/lib/utils.ts"), "utf-8") !== STOCK_UTILS)
    failures.push("installing a component changed the stock lib/utils.ts")
  writeFileSync(
    join(app, "src/stock-probe.tsx"),
    `import { renderToStaticMarkup } from "react-dom/server"
import { Button } from "~/ui/button"
console.log(renderToStaticMarkup(<Button>Save</Button>))
`
  )
  let stockButton = ""
  try {
    stockButton = await run(
      join(ROOT, "node_modules/.bin/tsx"),
      ["src/stock-probe.tsx"],
      app
    )
  } catch (e) {
    failures.push(
      `the Button installed over the stock utils does not run: ${e}`
    )
  }
  rmSync(join(app, "src/stock-probe.tsx"))

  // -------------------------------------------------------------------------
  // 4. Install every item, as a consumer would
  // -------------------------------------------------------------------------
  const names = registry.items.map((i) => i.name)
  const add = (items: string[]) =>
    run(SHADCN, ["add", ...items.map(addressOf), "--yes", "--overwrite"], app)
  await add(names.filter((n) => !novaOnly.has(n)))

  // A consumer that stays on lyra gets nothing of nova's.
  const novaFonts = nextFontsOf(ROOT, NOVA_FONTS).loaded
  const lyraCss = readFileSync(join(app, "src/app.css"), "utf-8")
  const lyraManifest = readFileSync(join(app, "package.json"), "utf-8")
  if (/(?:^|\n)\s*\.nova\b/.test(lyraCss))
    failures.push("the base item ships a .nova block: nova must be opt-in")
  for (const font of novaFonts) {
    const slug = font.family.toLowerCase().replace(/\s+/g, "-")
    if (lyraCss.includes(font.variable!) || lyraCss.includes(font.family))
      failures.push(`the base item's stylesheet mentions ${font.family}`)
    if (lyraManifest.includes(`@fontsource-variable/${slug}`))
      failures.push(`a lyra consumer gets the ${font.family} package`)
  }

  await add([THEME_NOVA])

  // -------------------------------------------------------------------------
  // 5. What the consumer ends up with
  // -------------------------------------------------------------------------
  const expected = registry.items.flatMap((i) =>
    (i.files ?? []).map((f) =>
      f.target
        ? f.target.replace(/^~\//, "")
        : f.path
            .replace(/^components\/ui\//, "src/ui/")
            .replace(/^(lib|hooks)\//, "src/$1/")
    )
  )
  const missing = expected.filter((f) => !existsSync(join(app, f)))
  if (missing.length > 0)
    failures.push(`files not installed: ${missing.join(", ")}`)

  // Files shipped to an explicit target must arrive byte for byte.
  const drifted = registry.items.flatMap((i) =>
    (i.files ?? [])
      .filter((f) => f.target)
      .filter((f) => {
        const installed = join(app, f.target!.replace(/^~\//, ""))
        return (
          existsSync(installed) &&
          readFileSync(installed, "utf-8") !==
            readFileSync(join(ROOT, f.path), "utf-8")
        )
      })
      .map((f) => f.target!)
  )
  if (drifted.length > 0)
    failures.push(
      `targeted files differ from their source: ${drifted.join(", ")}`
    )

  const sources = ["ui", "lib", "hooks"].flatMap((dir) =>
    existsSync(join(app, "src", dir))
      ? readdirSync(join(app, "src", dir)).map((f) => join(app, "src", dir, f))
      : []
  )
  const unrewritten = sources.filter((f) =>
    /from "@\//.test(readFileSync(f, "utf-8"))
  )
  if (unrewritten.length > 0)
    failures.push(
      `imports not rewritten to the consumer's aliases: ${unrewritten
        .map((f) => f.slice(app.length + 1))
        .join(", ")}`
    )

  const css = readFileSync(join(app, "src/app.css"), "utf-8")
  for (const needle of [
    "--color-background-default",
    ".dark",
    "--color-primary",
    ".nova",
  ])
    if (!css.includes(needle))
      failures.push(`src/app.css lacks ${needle} — tokens were not merged`)

  // On <html class="nova dark"> the two blocks tie on specificity: .nova has
  // to come after .dark, and nova's own dark block after it.
  const blockAt = (selector: string) =>
    css.search(new RegExp(`(?:^|\\n)\\s*${selector}\\s*\\{`))
  const order = [
    ["\\.dark", blockAt("\\.dark")],
    ["\\.nova", blockAt("\\.nova")],
    ["\\.nova\\.dark", blockAt("\\.nova\\.dark,[^{]*")],
  ] as const
  if (
    order.some(([, at]) => at === -1) ||
    order[0][1] > order[1][1] ||
    order[1][1] > order[2][1]
  )
    failures.push(
      `src/app.css does not hold .dark, .nova and .nova.dark in that order: ${order.map(([s, at]) => `${s} at ${at}`).join(", ")}`
    )

  // -------------------------------------------------------------------------
  // 6. What Tailwind builds from it
  // -------------------------------------------------------------------------
  writeFileSync(
    join(app, "src/probe.tsx"),
    `export const Probe = () => <div className="${[...PRESENT, ...ABSENT].join(
      " "
    )}" />\n`
  )
  await run(
    join(app, "node_modules/.bin/tailwindcss"),
    ["-i", "src/app.css", "-o", "built.css"],
    app
  )
  const built = readFileSync(join(app, "built.css"), "utf-8")
  const emits = (utility: string) =>
    new RegExp(
      `\\.${utility.replace(/[:/]/g, (c) => `\\\\${c}`)}(?![\\w-])`
    ).test(built)

  for (const utility of PRESENT)
    if (!emits(utility))
      failures.push(`${utility} generates no CSS in the consumer's app`)
  for (const utility of ABSENT)
    if (emits(utility))
      failures.push(
        `${utility} generates CSS in the consumer's app — the lockdown leaks`
      )
  if (/@media[^{]*var\(/.test(built))
    failures.push(
      "a media query reads var(): responsive variants (sm:, md:…) never match"
    )
  if (!/--spacing:\s*var\(--space-scale-1\)/.test(built))
    failures.push(
      "--spacing is not set at runtime: tw-animate-css slides (slide-in-from-top-2) lose their offset"
    )
  if (!/:where\(\[data-state="open"\]\)/.test(built))
    failures.push('data-open: does not match Radix\'s data-state="open"')
  if (
    !/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*--tw-enter-scale:\s*initial\s*!important/.test(
      built
    )
  )
    failures.push(
      "the reduced-motion block of globals.css did not reach the consumer's app: entrances and exits still zoom and slide"
    )

  const faces = new Set(
    [...built.matchAll(/@font-face\s*\{[^}]*font-family:\s*([^;]+);/g)].map(
      (m) => m[1].trim().replace(/^["']|["']$/g, "")
    )
  )
  /** A declaration's value in the built CSS, through any var() chain: an
   * undeclared variable falls to its fallback, and a cycle
   * (`--font-mono: var(--font-mono)`) resolves to nothing, as in CSS. */
  const resolveValue = (
    value: string | undefined,
    seen = new Set<string>()
  ): string | undefined => {
    const ref = value?.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/)
    if (!ref) return value
    if (seen.has(ref[1])) return undefined
    seen.add(ref[1])
    const declared = built.match(new RegExp(`${ref[1]}:\\s*([^;]+);`))?.[1]
    return resolveValue(declared ?? ref[2], seen)
  }
  const firstFaceOf = (value: string | undefined) =>
    value
      ?.split(",")[0]
      .trim()
      .replace(/^["']|["']$/g, "")
  const familyOf = (utility: string) =>
    resolveValue(
      built.match(
        new RegExp(`\\.${utility}\\s*\\{\\s*font-family:\\s*([^;]+);`)
      )?.[1]
    )
  const buttonClasses = /class="([^"]*)"/.exec(stockButton)?.[1].split(" ")
  const textUiSize = resolveValue(
    built.match(/\.text-ui\s*\{[^}]*?font-size:\s*([^;]+);/)?.[1]
  )
  if (!buttonClasses?.includes("text-ui") || textUiSize !== "0.75rem")
    failures.push(
      `a Button over the stock lib/utils.ts loses its 12px: its classes are "${buttonClasses?.join(" ") ?? stockButton}", text-ui is ${textUiSize ?? "nothing"}`
    )

  // From lib/fonts.ts, not from the registry under test: a registry that
  // ships no font at all must fail here too.
  for (const font of nextFontsOf(ROOT).loaded) {
    const utility = font.variable!.slice(2)
    const value = familyOf(utility)
    const family = firstFaceOf(value)
    if (!family || !faces.has(family))
      failures.push(
        `${utility} sets font-family to ${value ?? "nothing"}, which no @font-face declares (${[...faces].join(", ") || "none"})`
      )
  }
  const htmlFont = resolveValue(
    built.match(/(?:^|\n)\s*html\s*\{[^}]*font-family:\s*([^;]+);/)?.[1]
  )
  if (!htmlFont || htmlFont !== familyOf("font-mono"))
    failures.push(
      `<html> is set in ${htmlFont ?? "the browser default"}, not in font-mono`
    )

  // Nova: each face it loads has an @font-face, and font-sans and font-mono,
  // which Tailwind compiled with lyra's family, read the token under .nova.
  for (const font of novaFonts) {
    const value = resolveValue(`var(${font.variable})`)
    if (!faces.has(firstFaceOf(value) ?? ""))
      failures.push(
        `${font.variable} is ${value ?? "nothing"}, which no @font-face declares`
      )
  }
  const novaBlock = built.match(/(?:^|\n)\s*\.nova\s*\{([^}]*)\}/)?.[1] ?? ""
  for (const key of ["body", "heading", "sans", "mono"]) {
    const value = resolveValue(
      novaBlock.match(
        new RegExp(`--typography-font-family-${key}:\\s*([^;]+);`)
      )?.[1]
    )
    if (!faces.has(firstFaceOf(value) ?? ""))
      failures.push(
        `.nova sets typography.font-family.${key} to ${value ?? "nothing"}, which no @font-face declares`
      )
  }
  for (const key of ["sans", "mono"])
    if (
      !new RegExp(
        `\\.nova \\.font-${key}\\s*\\{\\s*font-family:\\s*var\\(--typography-font-family-${key}\\)`
      ).test(built)
    )
      failures.push(`font-${key} does not follow the token under .nova`)
  if (
    !/--default-mono-font-family:\s*var\(--typography-font-family-mono\)/.test(
      novaBlock
    )
  )
    failures.push(
      "code, kbd, samp and pre keep lyra's mono family under .nova: preflight reads --default-mono-font-family"
    )

  try {
    await run(join(app, "node_modules/.bin/tsc"), ["-p", "."], app)
  } catch (e) {
    failures.push(`the installed components do not type-check:\n${e}`)
  }

  if (failures.length > 0) {
    console.error(
      `❌ test-registry-install (${SOURCE}): ${failures.length} problem(s)\n` +
        failures.map((f) => `   · ${f}`).join("\n")
    )
    process.exitCode = 1
  } else {
    console.log(
      `✅ test-registry-install (${SOURCE}): ${names.length} items installed into a blank app, ` +
        `${expected.length} files, imports rewritten, tokens merged, lockdown, fonts and variants built, tsc clean.`
    )
  }
} catch (e) {
  console.error(`❌ test-registry-install (${SOURCE}): ${e}`)
  process.exitCode = 1
} finally {
  server?.close()
  if (KEEP) console.log(`   app kept at ${app}`)
  else rmSync(work, { recursive: true, force: true })
}
