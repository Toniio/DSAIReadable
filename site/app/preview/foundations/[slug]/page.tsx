import { foundationExampleKeys } from "@/site/lib/foundation-examples"
import { PreviewFrame } from "@/site/playground/frame"

export const dynamicParams = false

export function generateStaticParams() {
  return foundationExampleKeys().map((slug) => ({ slug }))
}

export default async function FoundationPreview({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return <PreviewFrame kind="foundation" name={(await params).slug} />
}
