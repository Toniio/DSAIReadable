/**
 * Language lint — everything committed is written in English (AGENTS.md § 1).
 *
 * The repository was moved to native English in one pass; nothing stopped a
 * French comment, spec line or demo string from coming back afterwards. This
 * scans every tracked text file for two signals that do not occur in English
 * prose or code:
 *   ① French function words, matched as whole words;
 *   ② letters with French diacritics.
 *
 * Known false positives are left out of the word list rather than excused
 * per line: "sans" is the font family (`sans-serif`, `font-sans`, Geist Sans).
 * Lockfiles are skipped: their integrity hashes are base64, not language.
 * So is this file, whose word list is the French it looks for.
 *
 *   npx tsx scripts/lint-language.ts
 */

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { dirname, extname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** Words that carry no meaning in English and are frequent in any French text. */
const FRENCH_WORDS = [
  "les",
  "des",
  "une",
  "pour",
  "avec",
  "dans",
  "sur",
  "est",
  "sont",
  "cette",
  "ces",
  "leur",
  "mais",
  "aussi",
  "chaque",
  "jamais",
  "toujours",
  "doit",
  "peut",
  "qui",
  "que",
  "nous",
  "vous",
  "être",
  "très",
]

const WORD = new RegExp(
  `(?<![\\p{L}\\p{N}_-])(?:${FRENCH_WORDS.join("|")})(?![\\p{L}\\p{N}_-])`,
  "giu"
)
// Letters French uses and English does not; ä, ö, ü are left to German names
// (Björn Ottosson, cited for OKLab).
const DIACRITIC = /[àâçéèêëîïôùûœ]/giu

const SKIPPED_FILES = new Set([
  "package-lock.json",
  "mcp-server/package-lock.json",
  // This file: its word list is the French it looks for.
  "scripts/lint-language.ts",
])
const BINARY = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".webp",
  ".woff",
  ".woff2",
])

const files = execFileSync("git", ["ls-files", "-z"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\0")
  .filter(
    (file) => file && !SKIPPED_FILES.has(file) && !BINARY.has(extname(file))
  )

type Finding = { file: string; line: number; match: string }
const findings: Finding[] = []

for (const file of files) {
  let source: string
  try {
    source = readFileSync(resolve(ROOT, file), "utf8")
  } catch {
    continue // a symlink to a directory, or a file deleted but not yet staged
  }
  source.split("\n").forEach((line, i) => {
    for (const pattern of [WORD, DIACRITIC]) {
      for (const m of line.matchAll(pattern)) {
        findings.push({ file, line: i + 1, match: m[0] })
      }
    }
  })
}

if (findings.length > 0) {
  console.error(
    `❌ lint-language: ${findings.length} French word(s) or letter(s).\n`
  )
  for (const f of findings)
    console.error(`   ${f.file}:${f.line} — "${f.match}"`)
  console.error(
    `\n   Everything committed is written in English (AGENTS.md § 1). Rewrite natively, do not translate.`
  )
  process.exit(1)
}

console.log(`✅ lint-language: ${files.length} tracked files, all in English.`)
