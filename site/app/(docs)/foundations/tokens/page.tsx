import type { Metadata } from "next"
import Link from "next/link"

import { FoundationEyebrow } from "@/site/foundation-docs/a/page-bits"
import { LINK } from "@/site/ui/link"
import { tokensData } from "@/site/foundation-docs/a/tokens-data"
import { TokensTable } from "@/site/foundation-docs/a/tokens-table"
import { foundation, foundationsNav } from "@/site/lib/nav"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "All tokens",
  description: foundation("tokens").summary,
}

const TOC = [{ id: "tokens", label: "Tokens" }]

export default function AllTokensPage() {
  const data = tokensData()
  const tier = (name: string) =>
    data.rows.filter((row) => row.tier === name).length

  return (
    <DocsPage nav={foundationsNav()} navLabel="Foundations" toc={TOC}>
      <PageHeader
        eyebrow={<FoundationEyebrow group="Reference" />}
        title="All tokens"
        lead={
          <>
            {data.rows.length} tokens in three tiers: {tier("semantic")}{" "}
            semantic tokens the components read, {tier("component")} shadcn/ui
            aliases over them, and {tier("primitive")} private primitives they
            pick from. Values are resolved by the token build, in light and
            dark. The{" "}
            <Link href="/foundations/color/" className={LINK}>
              Color
            </Link>{" "}
            and{" "}
            <Link href="/foundations/typography/" className={LINK}>
              Typography
            </Link>{" "}
            pages lay them out by role.
          </>
        }
      />

      <DocSection
        id="tokens"
        title="Tokens"
        description="Filter by tier, type and status, or search a name, a CSS variable, a class or a value. Primitives are listed for reference only: a component never reads one."
      >
        <div className="flex min-w-0 flex-col gap-4">
          <TokensTable data={data} />
        </div>
      </DocSection>
    </DocsPage>
  )
}
