import type { Metadata } from "next"

import { categoryId } from "@/site/component-docs/category-id"
import { ComponentIndex } from "@/site/component-docs/component-index"
import {
  CATEGORY_ORDER,
  components,
  componentsByCategory,
  componentSpec,
} from "@/site/lib/components"
import { plain } from "@/site/lib/markdown"
import { componentsNav } from "@/site/lib/nav"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every component of the design system, grouped by category, each with its spec example drawn live.",
}

export default function ComponentsPage() {
  const all = components()
  const count = (status: string) =>
    all.filter((entry) => entry.status === status).length
  const statuses = [
    `${count("stable")} stable`,
    `${count("beta")} in beta`,
    count("deprecated") ? `${count("deprecated")} deprecated` : "",
  ].filter(Boolean)
  const groups = componentsByCategory()
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    )
    .map(({ category, items }) => ({
      id: categoryId(category),
      category,
      items: items.map((entry) => ({
        name: entry.name,
        slug: entry.slug,
        status: entry.status,
        role: plain(componentSpec(entry.name).role),
      })),
    }))

  // The index frames the page itself: its "On this page" follows the filter.
  return (
    <ComponentIndex
      nav={componentsNav()}
      header={
        <PageHeader
          title="Components"
          lead={`${all.length} components, grouped by category: ${statuses.join(", ")}. Each card draws its spec's example, live.`}
        />
      }
      groups={groups}
      total={all.length}
    />
  )
}
