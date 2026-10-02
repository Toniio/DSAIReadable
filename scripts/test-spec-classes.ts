/**
 * Fixture test of scripts/lib/spec-classes.ts: how the spec generators follow
 * a `*Variants` function a component calls from another component, and the
 * variant a component renders another one with.
 *
 * It writes small component files in a temporary directory and reads them
 * back through the same functions the States and Tokens generators use:
 *
 *   ① a call's arguments resolve from a literal, a destructuring default, a
 *      shorthand property, `||` and `??`, and a key it leaves out takes the
 *      composed config's `defaultVariants`; only the base classes and those of
 *      the values applied come along, each with the part that applies them;
 *   ② an argument that does not resolve, and a config with compoundVariants,
 *      fail the run instead of falling back;
 *   ③ a "Not entered through" declaration drops the classes of its states that
 *      come through the function it names, and nothing else;
 *   ④ the Composes sites name the variant of each JSX element, both branches
 *      of a conditional, never a JSDoc `@example`, and stay after the " — "
 *      the MCP server splits on.
 *
 *   npx tsx scripts/test-spec-classes.ts
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  composedOf,
  composesLine,
  neverEntered,
  notEnteredOf,
  stringsOf,
  variantsAppliedBy,
} from "./lib/spec-classes.js"

const tmp = mkdtempSync(join(tmpdir(), "dsai-spec-classes-"))
const failures: string[] = []

function expect(ok: boolean, what: string) {
  console.log(`${ok ? "ok  " : "FAIL"}  ${what}`)
  if (!ok) failures.push(what)
}

function write(name: string, source: string) {
  mkdirSync(join(tmp, "components/ui"), { recursive: true })
  writeFileSync(join(tmp, "components/ui", name), source)
  return `components/ui/${name}`
}

async function texts(file: string) {
  return (await stringsOf(tmp, file)).map((s) => s.text)
}

async function failure(run: () => unknown): Promise<string> {
  try {
    await run()
    return ""
  } catch (error) {
    return (error as Error).message
  }
}

const IMPORT = `import { fixtureVariants } from "@/components/ui/fixture"\n`

try {
  write(
    "fixture.tsx",
    `import { cva } from "class-variance-authority"
const fixtureVariants = cva("base-class", {
  variants: {
    variant: { default: "hover:bg-primary/80", ghost: "hover:bg-muted" },
    size: { default: "h-8", sm: "h-7" },
  },
  defaultVariants: { variant: "default", size: "default" },
})
export function Fixture() { return <button /> }
export { fixtureVariants }
`
  )

  // ① Resolution
  const cases: [string, string][] = [
    [
      "a literal",
      `export function Part() { return <a className={fixtureVariants({ variant: "ghost" })} /> }`,
    ],
    [
      "a destructuring default",
      `export function Part({ look = "ghost" }) { return <a className={fixtureVariants({ variant: look })} /> }`,
    ],
    [
      "a shorthand property",
      `export function Part({ variant = "ghost" }) { return <a className={fixtureVariants({ variant })} /> }`,
    ],
    [
      "the first resolvable operand of ||",
      `export function Part({ variant = "ghost" }) { const context = useContext(C); return <a className={fixtureVariants({ variant: context.variant || variant })} /> }`,
    ],
    [
      "the first resolvable operand of ??",
      `export function Part({ variant }: { variant?: string }) { return <a className={fixtureVariants({ variant: variant ?? "ghost" })} /> }`,
    ],
  ]
  for (const [what, body] of cases) {
    const file = write("composer.tsx", IMPORT + body)
    const found = await texts(file).catch((): string[] => [])
    expect(
      found.includes("hover:bg-muted") &&
        !found.includes("hover:bg-primary/80") &&
        found.includes("base-class") &&
        found.includes("h-8") &&
        !found.includes("h-7"),
      `① ${what} resolves to ghost, the size left out to its default`
    )
  }
  const literal = write("literal.tsx", IMPORT + cases[0][1])
  const where = (await stringsOf(tmp, literal)).find(
    (s) => s.text === "hover:bg-muted"
  )
  expect(
    where?.where === "`Part` via `fixtureVariants.variant.ghost`" &&
      where.via === "fixtureVariants",
    "① a followed class names the part that applies it and where it sits"
  )
  const applied = variantsAppliedBy(tmp, literal)
  expect(
    applied.get("fixtureVariants")?.get("variant")?.join() === "ghost" &&
      applied.get("fixtureVariants")?.get("size")?.join() === "default",
    "① the footer's applied values include the defaults cva fills in"
  )

  // ② Failures
  const unresolved = write(
    "unresolved.tsx",
    IMPORT +
      `export function Part({ variant }: { variant?: string }) { return <a className={fixtureVariants({ variant })} /> }`
  )
  expect(
    (await failure(() => stringsOf(tmp, unresolved))).includes(
      "cannot resolve `variant`"
    ),
    "② an argument with no literal to resolve to fails the run"
  )
  const spread = write(
    "spread.tsx",
    IMPORT +
      `export function Part(props: object) { return <a className={fixtureVariants({ ...props })} /> }`
  )
  expect(
    (await failure(() => stringsOf(tmp, spread))).includes(
      "is not a key the generators follow"
    ),
    "② a spread argument fails the run"
  )
  write(
    "compound.tsx",
    `import { cva } from "class-variance-authority"
const compoundVariants = cva("x", { variants: { variant: { a: "y" } }, compoundVariants: [{ variant: "a", class: "z" }] })
export { compoundVariants }
`
  )
  const compound = write(
    "compound-user.tsx",
    `import { compoundVariants } from "@/components/ui/compound"\nexport function Part() { return <a className={compoundVariants({ variant: "a" })} /> }`
  )
  expect(
    (await failure(() => stringsOf(tmp, compound))).includes(
      "compoundVariants"
    ),
    "② a composed config with compoundVariants fails the run"
  )

  // ③ Declared states
  const declared = notEnteredOf(
    "| `hover` | `hover:bg-muted` | x |\n\nNot entered through `fixtureVariants`: `disabled`, `error` — the dependency sets `aria-disabled`, never `disabled`.\n"
  )
  expect(
    declared.length === 1 &&
      declared[0].fn === "fixtureVariants" &&
      declared[0].states.join() === "disabled,error",
    "③ a declaration is read with its function and its states"
  )
  const drop = (candidate: string, via?: string) =>
    neverEntered(candidate, via, declared, "components/ui/composer.tsx")
  expect(
    drop("disabled:opacity-disabled", "fixtureVariants") &&
      drop("aria-invalid:focus-visible:outline-destructive", "fixtureVariants"),
    "③ a class waiting for a declared state is dropped, stacked or not"
  )
  expect(
    !drop("hover:bg-muted", "fixtureVariants") &&
      !drop("disabled:opacity-disabled") &&
      !drop("disabled:opacity-disabled", "otherVariants"),
    "③ the component's own classes and another function's are kept"
  )

  // ④ Composes sites
  const specOf = new Map([["components/ui/fixture.tsx", "Fixture"]])
  const sites = write(
    "sites.tsx",
    `import { Fixture } from "@/components/ui/fixture"
/**
 * @example
 * <Fixture variant="destructive" />
 */
export function Part({ on }: { on: boolean }) {
  return <Fixture variant={on ? "outline" : "ghost"} size="sm" />
}
export function Other() {
  return <Fixture>plain</Fixture>
}
`
  )
  const composed = composedOf(tmp, sites, specOf)
  expect(
    composed.specs.join() === "Fixture" &&
      composed.sites.join("; ") ===
        "Fixture in Part: variant outline or ghost, size sm",
    "④ a site shows both branches of a conditional and skips the JSDoc example"
  )
  const line = composesLine(composed, "tokens") ?? ""
  expect(
    [...line.split(" — ")[0].matchAll(/`(\w+)`/g)].map((m) => m[1]).join() ===
      "Fixture",
    "④ the sites stay after the ' — ' the MCP server reads specs before"
  )
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(
    `❌ test-spec-classes: ${failures.length} case(s) failed:\n` +
      failures.map((f) => `   - ${f}`).join("\n")
  )
  process.exit(1)
}
console.log("✅ test-spec-classes: every case passes.")
