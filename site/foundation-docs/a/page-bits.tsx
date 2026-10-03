import Link from "next/link"

import { LINK } from "@/site/ui/link"

/** The style of a link in running text. */

/** "Foundations / Tokens": the line above a foundation page's title. */
export function FoundationEyebrow({ group }: { group: string }) {
  return (
    <span>
      <Link href="/foundations/" className={LINK}>
        Foundations
      </Link>{" "}
      / {group}
    </span>
  )
}

/** A spec without its `# ` title line: the page draws its own. */
export function withoutTitle(markdown: string): string {
  return markdown.replace(/^# .*\n+/, "")
}
