import { createRule } from "./utils.js"

type Options = [{ modules?: Record<string, string> }?]

/**
 * Forbid what the design system has deprecated. The list is an option: a key is
 * an import source (`@/components/ui/foo`) or one of its named exports
 * (`@/components/ui/foo#Bar`), its value what to use instead.
 */
export default createRule<Options, "deprecated">({
  name: "no-deprecated-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Forbid imports the design system has deprecated",
    },
    messages: {
      deprecated: '"{{name}}" is deprecated: {{reason}}',
    },
    schema: [
      {
        type: "object",
        properties: {
          modules: {
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
    const modules = options?.modules ?? {}
    const lookup = (name: string) =>
      Object.hasOwn(modules, name) ? modules[name] : undefined
    return {
      ImportDeclaration(node) {
        const source = node.source.value
        const whole = lookup(source)
        if (whole !== undefined)
          return context.report({
            node,
            messageId: "deprecated",
            data: { name: source, reason: whole },
          })
        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue
          const imported =
            specifier.imported.type === "Identifier"
              ? specifier.imported.name
              : specifier.imported.value
          const reason = lookup(`${source}#${imported}`)
          if (reason !== undefined)
            context.report({
              node: specifier,
              messageId: "deprecated",
              data: { name: `${source}#${imported}`, reason },
            })
        }
      },
    }
  },
})
