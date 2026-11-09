import type { TSESTree } from "@typescript-eslint/utils"
import { createRule, textOf } from "./utils.js"

/** A text role, through its variants, `!` and line-height modifier. */
const TEXT_ROLE = /(?:^|:)!?text-(?:ui|description|title|control)(?:\/\S+)?!?$/

/** The design system's module under any alias or relative path. */
const OWN_CN = /(?:^|\/)lib\/cn$|^\.{1,2}\/cn$/

/** The strings of one argument of `cn()`, condition tests left out. */
function classStringsOf(node: TSESTree.Node): TSESTree.Node[] {
  switch (node.type) {
    case "Literal":
      return [node]
    case "TemplateLiteral":
      return [...node.quasis, ...node.expressions.flatMap(classStringsOf)]
    case "ArrayExpression":
      return node.elements.flatMap((e) => (e ? classStringsOf(e) : []))
    case "ObjectExpression":
      return node.properties.flatMap((p) =>
        p.type === "Property" ? [p.key] : []
      )
    case "ConditionalExpression":
      return [
        ...classStringsOf(node.consequent),
        ...classStringsOf(node.alternate),
      ]
    case "LogicalExpression":
      return [...classStringsOf(node.left), ...classStringsOf(node.right)]
    default:
      return []
  }
}

/**
 * The stock `cn` of shadcn/ui runs a tailwind-merge that does not know the
 * text roles: it reads `text-ui` as a color and drops it next to
 * `text-muted-foreground`, and the element loses its size. `@/lib/cn` is the
 * design system's, with the roles configured.
 */
export default createRule({
  name: "no-text-role-in-stock-cn",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid a text role class in a cn() that is not the design system's: its tailwind-merge drops the role",
    },
    messages: {
      stockCn:
        '"{{role}}" goes through the cn of "{{source}}", whose tailwind-merge does not know the text roles and can drop it. Import cn from "@/lib/cn".',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const stock = new Map<string, string>()
    return {
      Program(program) {
        for (const statement of program.body) {
          if (statement.type !== "ImportDeclaration") continue
          if (OWN_CN.test(statement.source.value)) continue
          for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportSpecifier") continue
            const { imported } = specifier
            if (
              (imported.type === "Identifier"
                ? imported.name
                : imported.value) === "cn"
            )
              stock.set(specifier.local.name, statement.source.value)
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier") return
        const source = stock.get(node.callee.name)
        if (source === undefined) return
        for (const string of node.arguments.flatMap(classStringsOf)) {
          const role = textOf(string)
            ?.split(/\s+/)
            .find((word) => TEXT_ROLE.test(word))
          if (role)
            context.report({
              node: string,
              messageId: "stockCn",
              data: { role, source },
            })
        }
      },
    }
  },
})
