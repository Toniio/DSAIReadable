import type { TSESTree } from "@typescript-eslint/utils"
import { createRule } from "./utils.js"

/** Icon kits: Phosphor is the only one (AGENTS.md § 1). */
const ICON_KITS = [
  /^lucide-react(\/|$)/,
  /^@heroicons\//,
  /^react-icons(\/|$)/,
  /^@radix-ui\/react-icons$/,
  /^@tabler\/icons-react$/,
  /^react-feather$/,
  /^@fortawesome\//,
  /^@mui\/icons-material(\/|$)/,
  /^iconoir-react$/,
  /^@iconify\//,
]

/**
 * UI libraries and the primitives the components wrap. The design system's
 * components are installed in `@/components/ui`: a component imported from one
 * of these is a second design system next to it.
 */
const UI_LIBRARIES = [
  /^@radix-ui\//,
  /^radix-ui$/,
  /^@base-ui\//,
  /^@headlessui\//,
  /^@mui\/(material|joy|base|system)(\/|$)/,
  /^@chakra-ui\//,
  /^@mantine\//,
  /^antd(\/|$)/,
  /^react-aria-components$/,
  /^@ariakit\//,
  /^@nextui-org\//,
  /^@heroui\//,
  /^primereact(\/|$)/,
  /^react-bootstrap(\/|$)/,
]

/** Something that looks like a component of the design system but is not where the registry installs it. */
const FOREIGN_ORIGIN = /(?:components\/ui|design-system|make-kit|ui-kit)/

type Options = [{ allowedOrigins?: string[] }?]

export default createRule<Options, "icons" | "library" | "origin">({
  name: "no-external-ui-imports",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid UI components and icons imported from anywhere but the design system",
    },
    messages: {
      icons:
        'Icons come from @phosphor-icons/react only (AGENTS.md § 1): "{{source}}" is another icon kit.',
      library:
        'Use the component from the design system (`@/components/ui/<name>`) instead of importing "{{source}}" directly.',
      origin:
        'UI components are imported from `@/components/ui/<name>`, where the shadcn registry installs them, not from "{{source}}".',
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedOrigins: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const allowed = options?.allowedOrigins ?? ["@/components/ui/"]
    const check = (
      node:
        | TSESTree.ImportDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ExportAllDeclaration
    ) => {
      const source = node.source?.value
      if (typeof source !== "string") return
      const data = { source }
      if (ICON_KITS.some((kit) => kit.test(source)))
        return context.report({ node, messageId: "icons", data })
      if (UI_LIBRARIES.some((library) => library.test(source)))
        return context.report({ node, messageId: "library", data })
      if (
        FOREIGN_ORIGIN.test(source) &&
        !allowed.some((origin) => source.startsWith(origin))
      )
        return context.report({ node, messageId: "origin", data })
    }
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    }
  },
})
