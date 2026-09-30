import type { TSESTree } from "@typescript-eslint/utils"
import { createRule } from "./utils.js"

/** Each native element and the design system component that replaces it. */
const REPLACEMENTS: Record<string, string> = {
  button: "Button (`@/components/ui/button`)",
  input: "Input (`@/components/ui/input`)",
  select: "Select (`@/components/ui/select`) or NativeSelect",
  textarea: "Textarea (`@/components/ui/textarea`)",
  label: "Label (`@/components/ui/label`), or FieldLabel inside a Field",
  table: "Table (`@/components/ui/table`)",
  dialog: "Dialog (`@/components/ui/dialog`)",
  a: "Button with `asChild` (`@/components/ui/button`), which keeps the look of the design system",
}

/** `<a>` is how a Button with `asChild` renders a link: only that parent makes it valid. */
function isAsChildChild(node: TSESTree.JSXOpeningElement): boolean {
  const element = node.parent
  const parent = element?.parent
  return (
    parent?.type === "JSXElement" &&
    parent.openingElement.attributes.some(
      (attribute) =>
        attribute.type === "JSXAttribute" &&
        attribute.name.type === "JSXIdentifier" &&
        attribute.name.name === "asChild"
    )
  )
}

export default createRule({
  name: "no-native-interactive-elements",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require the design system component where a native interactive element is written",
    },
    messages: {
      native:
        "Use {{component}} instead of a native <{{tag}}>: it carries the design system's tokens, states and accessibility.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return
        const tag = node.name.name
        // Case-sensitive on purpose: <input> is HTML, <Input> is the component.
        if (!Object.hasOwn(REPLACEMENTS, tag)) return
        if (tag === "a" && isAsChildChild(node)) return
        context.report({
          node,
          messageId: "native",
          data: { tag, component: REPLACEMENTS[tag] },
        })
      },
    }
  },
})
