import { PreviewFrame } from "@/site/playground/frame"
import { patternNames } from "@/site/lib/patterns"

export const dynamicParams = false

export function generateStaticParams() {
  return patternNames().map((slug) => ({ slug }))
}

export default async function PatternPreview({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return <PreviewFrame kind="pattern" name={(await params).slug} />
}
