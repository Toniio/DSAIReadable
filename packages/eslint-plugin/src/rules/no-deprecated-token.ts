import { createRule, textOf } from "./utils.js"

type Options = [{ tokens?: Record<string, string> }?]

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** `md:hover:!bg-x/50` → `bg-x`: the class Tailwind resolves, without its variants and modifiers. */
const baseClass = (token: string) =>
  token
    .slice(token.lastIndexOf(":") + 1)
    .replace(/^!|!$/g, "")
    .replace(/\/[\w.[\]%-]+$/, "")

/**
 * Forbid the tokens the design system has deprecated. The list is an option: a
 * key is a CSS variable (`--opacity-placeholder`), found wherever it is written
 * in a string (`var(--opacity-placeholder)`, `bg-(--opacity-placeholder)`), or a
 * Tailwind class the token is bridged to, found among the classes of a string;
 * its value is why, and what to use instead.
 */
export default createRule<Options, "deprecated">({
  name: "no-deprecated-token",
  meta: {
    type: "problem",
    docs: {
      description: "Forbid the design tokens the design system has deprecated",
    },
    messages: {
      deprecated: '"{{name}}" is deprecated: {{reason}}',
    },
    schema: [
      {
        type: "object",
        properties: {
          tokens: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const entries = Object.entries(options?.tokens ?? {})
    const variables = entries
      .filter(([key]) => key.startsWith("--"))
      .map(
        ([name, reason]) =>
          [
            name,
            reason,
            new RegExp(`(?<![\\w-])${escapeRegExp(name)}(?![\\w-])`),
          ] as const
      )
    const classes = new Map(entries.filter(([key]) => !key.startsWith("--")))

    const check = (node: Parameters<typeof textOf>[0]) => {
      const text = textOf(node)
      if (text === undefined) return
      for (const [name, reason, pattern] of variables)
        if (pattern.test(text))
          context.report({
            node,
            messageId: "deprecated",
            data: { name, reason },
          })
      for (const token of text.split(/\s+/)) {
        const name = baseClass(token)
        const reason = classes.get(name)
        if (reason !== undefined)
          context.report({
            node,
            messageId: "deprecated",
            data: { name, reason },
          })
      }
    }
    return { Literal: check, TemplateElement: check }
  },
})
