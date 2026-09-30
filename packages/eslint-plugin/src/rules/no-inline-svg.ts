import { createRule } from "./utils.js"

export default createRule({
  name: "no-inline-svg",
  meta: {
    type: "problem",
    docs: {
      description: "Forbid inline <svg>: icons come from @phosphor-icons/react",
    },
    messages: {
      svg: "No inline SVG (AGENTS.md § 1): use an icon from @phosphor-icons/react. An icon drawn by hand is an icon outside the kit.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type === "JSXIdentifier" && node.name.name === "svg")
          context.report({ node, messageId: "svg" })
      },
    }
  },
})
