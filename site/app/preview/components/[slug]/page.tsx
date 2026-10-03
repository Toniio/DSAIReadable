import { notFound } from "next/navigation"

import { componentBySlug, components } from "@/site/lib/components"
import { PreviewFrame } from "@/site/playground/frame"

export const dynamicParams = false

export function generateStaticParams() {
  return components().map((entry) => ({ slug: entry.slug }))
}

export default async function ComponentPreview({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const entry = componentBySlug((await params).slug)
  if (!entry) notFound()
  return <PreviewFrame kind="component" name={entry.name} />
}
