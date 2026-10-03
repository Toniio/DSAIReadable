import { foundationExampleCode } from "@/site/lib/foundation-examples"
import { CodeBlock } from "@/site/ui/code-block"
import { FoundationExample } from "@/site/ui/foundation-example"

/**
 * A complete module of a foundation spec, rendered live above its code. The
 * module is the one site/generated/examples copies from the spec; the code
 * shown is the spec's, without the lines the copy adds.
 */
export function LiveExample({
  id,
  title,
}: {
  /** `<file>-<rank>`: `radius-1`. */
  id: string
  /** The caption above the code: `radius.md`. */
  title: string
}) {
  return (
    <div className="flex flex-col border">
      <FoundationExample exampleKey={id} title={`${title}: live example`} />
      <CodeBlock
        code={foundationExampleCode(id).trim()}
        language="tsx"
        title={title}
        className="border-x-0 border-b-0"
      />
    </div>
  )
}
