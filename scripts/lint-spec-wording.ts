/**
 * Spec wording lint — a rule in a component spec says what to do; it does not
 * leave the decision to the reader.
 *
 * "Avoid", "prefer", "if needed", "very short": each hands the call back to
 * the model generating code, which then guesses. Before P3-03, 94 lines of the
 * specs' rule sections were worded that way. They now read `**MUST**` /
 * `**MUST NOT**`, with a threshold or an observable criterion, or
 * `**SHOULD**` with its exception (`**unless** …`).
 *
 * Rules:
 *   ① in the sections that state rules (Usage, Constraints, Dependencies,
 *      Accessibility, Cross-references), no line uses a hedging word —
 *      unless it is a `**SHOULD**` line that names its exception with
 *      `**unless**`;
 *   ② every bullet of Constraints opens with `**MUST**`, `**MUST NOT**`,
 *      `**SHOULD**` or, for a fact that implies no rule, `**Note**` — so an
 *      agent tells what it must do from what it should know.
 *
 *   npx tsx scripts/lint-spec-wording.ts
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SPECS_DIR = resolve(ROOT, "specs/components")
const RULE_SECTIONS = new Set([
  "Usage",
  "Constraints",
  "Dependencies",
  "Accessibility",
  "Cross-references",
])
const HEDGES =
  /(?<![\p{L}])(avoid|prefer|preferably|preferred|ideally|generally|usually|typically|normally|recommended|consider|try to|if possible|where possible|when possible|whenever possible|as much as possible|as far as possible|if needed|when needed|as needed|if necessary|where necessary|when necessary|limit (?:it|them|to|the)|rather than|better to|best to|too (?:many|much|few|long|short|large|small|wide|narrow|big|dense)|very|appropriate|suitable|reasonable)(?![\p{L}])/iu
const SHOULD_WITH_EXCEPTION = /\*\*SHOULD\*\*.*\*\*unless\*\*/
const KEYWORD = /^- \*\*(MUST|MUST NOT|SHOULD|Note)\*\* — /

const findings: string[] = []
let checked = 0

for (const file of readdirSync(SPECS_DIR).filter((f) => f.endsWith(".md"))) {
  let section = ""
  readFileSync(resolve(SPECS_DIR, file), "utf-8")
    .split("\n")
    .forEach((line, i) => {
      if (line.startsWith("## ")) section = line.slice(3).trim()
      if (!RULE_SECTIONS.has(section) || line.startsWith("#")) return
      checked++
      if (
        section === "Constraints" &&
        line.startsWith("- ") &&
        !KEYWORD.test(line)
      )
        findings.push(
          `${file}:${i + 1} [Constraints] no keyword — ${line.trim().slice(0, 100)}`
        )
      const hedge = line.match(HEDGES)
      if (hedge && !SHOULD_WITH_EXCEPTION.test(line))
        findings.push(
          `${file}:${i + 1} [${section}] "${hedge[1]}" — ${line.trim().slice(0, 100)}`
        )
    })
}

if (findings.length > 0) {
  console.error(
    `❌ lint-spec-wording: ${findings.length} finding(s). Open each Constraints bullet with **MUST** / **MUST NOT** (threshold or observable criterion), **SHOULD** … **unless** <exception>, or **Note** for a fact; leave no hedge.\n\n   ${findings.join("\n   ")}\n`
  )
  process.exit(1)
}
console.log(
  `✅ lint-spec-wording: ${checked} line(s) of rule sections, none left to the reader's judgement.`
)
