import { ESLintUtils, type TSESTree } from "@typescript-eslint/utils"

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Toniio/DSAIReadable/blob/main/packages/eslint-plugin/README.md#${name}`
)

/** Functions whose arguments are class names. */
const CLASS_FUNCTIONS = new Set(["cn", "cva", "clsx", "twMerge", "tv"])

const CLASS_ATTRIBUTE = /^className$|ClassName$/

/** The kind of code a string sits in: Tailwind classes, inline style, or neither. */
export type StringContext = "class" | "style" | "other"

function attributeName(node: TSESTree.JSXAttribute): string | undefined {
  return node.name.type === "JSXIdentifier" ? node.name.name : undefined
}

/**
 * Where a string literal or template fragment is written. Walks up to the
 * nearest JSX attribute or call: a `className` attribute or a `cn(…)` call
 * makes it a class string, a `style` attribute an inline style. The walk stops
 * at the first JSX element, so a string in a child never inherits the
 * attribute of its parent.
 */
export function contextOf(node: TSESTree.Node): StringContext {
  for (let n: TSESTree.Node | undefined = node.parent; n; n = n.parent) {
    if (n.type === "JSXAttribute") {
      const name = attributeName(n)
      if (name && CLASS_ATTRIBUTE.test(name)) return "class"
      if (name === "style") return "style"
      return "other"
    }
    if (
      n.type === "CallExpression" &&
      n.callee.type === "Identifier" &&
      CLASS_FUNCTIONS.has(n.callee.name)
    )
      return "class"
    if (
      n.type === "JSXElement" ||
      n.type === "JSXFragment" ||
      n.type === "Program"
    )
      return "other"
  }
  return "other"
}

/** The text of a string literal or template fragment, `undefined` for anything else. */
export function textOf(node: TSESTree.Node): string | undefined {
  if (node.type === "Literal" && typeof node.value === "string")
    return node.value
  if (node.type === "TemplateElement") return node.value.cooked ?? undefined
  return undefined
}
