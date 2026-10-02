import type { TSESLint } from "@typescript-eslint/utils"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import { DEPRECATED_IMPORTS, DEPRECATED_TOKENS } from "./deprecations.js"
import noClassInterpolation from "./rules/no-class-interpolation.js"
import noDeprecatedImports from "./rules/no-deprecated-imports.js"
import noDeprecatedToken from "./rules/no-deprecated-token.js"
import noExternalUiImports from "./rules/no-external-ui-imports.js"
import noInlineSvg from "./rules/no-inline-svg.js"
import noNativeInteractiveElements from "./rules/no-native-interactive-elements.js"
import noRawValues from "./rules/no-raw-values.js"
import { version } from "./rules/utils.js"

const rules = {
  "no-class-interpolation": noClassInterpolation,
  "no-deprecated-imports": noDeprecatedImports,
  "no-deprecated-token": noDeprecatedToken,
  "no-external-ui-imports": noExternalUiImports,
  "no-inline-svg": noInlineSvg,
  "no-native-interactive-elements": noNativeInteractiveElements,
  "no-raw-values": noRawValues,
}

const SOURCE_FILES = ["**/*.{js,jsx,mjs,ts,tsx}"]

/**
 * What the registry installs into `components/ui` is the design system's own
 * code: it renders native elements and wraps the primitives on purpose. It is
 * not the consumer's to lint.
 */
const INSTALLED_COMPONENTS = ["**/components/ui/**"]

interface ConfigOptions {
  /**
   * Glob patterns of the files the rules leave alone. Defaults to what the
   * registry installs, the `components/ui` folders; `[]` lints everything, and
   * a narrower list keeps your own components in `components/ui` linted.
   */
  ignores?: string[]
  /** Add the Tailwind half (`eslint-plugin-better-tailwindcss`). Defaults to `true`. */
  tailwind?: boolean
}

const plugin = {
  meta: { name: "@dsaireadable/eslint-plugin", version },
  rules,
  configs: {} as Record<string, TSESLint.FlatConfig.Config[]>,
  createConfig,
}

/**
 * The rules that read the code alone: no stylesheet, no Tailwind, no disk.
 * `dsaireadable_validate_code` runs exactly these.
 */
const core = (ignores: string[]): TSESLint.FlatConfig.Config => ({
  name: "dsaireadable/core",
  files: SOURCE_FILES,
  ignores,
  plugins: { dsaireadable: plugin },
  rules: {
    "dsaireadable/no-native-interactive-elements": "error",
    "dsaireadable/no-external-ui-imports": "error",
    "dsaireadable/no-inline-svg": "error",
    "dsaireadable/no-class-interpolation": "error",
    "dsaireadable/no-raw-values": "error",
    "dsaireadable/no-deprecated-imports": [
      "error",
      { modules: DEPRECATED_IMPORTS },
    ],
    "dsaireadable/no-deprecated-token": [
      "error",
      { tokens: DEPRECATED_TOKENS },
    ],
  },
})

/**
 * The Tailwind half of the lockdown, which does read the real stylesheet:
 * `styles/globals.css` removes Tailwind's default colors, radii, shadows,
 * spacing and type scale, so `bg-red-500` or `p-13` generate no CSS, and this
 * turns the same class into an error before it ships, and `--fix` writes a
 * CSS variable in Tailwind's shorthand, `w-(--x)`. Point
 * `settings["better-tailwindcss"].entryPoint` at your stylesheet if it is not
 * `styles/globals.css`.
 */
const tailwind = (ignores: string[]): TSESLint.FlatConfig.Config => ({
  name: "dsaireadable/tailwind",
  files: SOURCE_FILES,
  ignores,
  plugins: {
    "better-tailwindcss":
      betterTailwindcss as unknown as TSESLint.FlatConfig.Plugin,
  },
  settings: { "better-tailwindcss": { entryPoint: "styles/globals.css" } },
  rules: {
    "better-tailwindcss/no-unknown-classes": "error",
    // `w-[var(--x)]` and the v3 `w-[--x]` become `w-(--x)`, variants kept.
    "better-tailwindcss/enforce-consistent-variable-syntax": "error",
    "better-tailwindcss/no-restricted-classes": [
      "error",
      {
        restrict: [
          {
            pattern: "^(.*disabled[^:]*:)opacity-\\d+$",
            message:
              "A disabled state uses the opacity.disabled token: write $1opacity-disabled.",
            fix: "$1opacity-disabled",
          },
          {
            pattern: "^(?!(?:.*:)?opacity-(?:0|100|disabled)$).*opacity-\\d+$",
            message:
              "Opacity is for binary states: show / hide with opacity-0 and opacity-100, or a color token such as text-muted-foreground to dim a text or an icon.",
          },
        ],
      },
    ],
  },
})

/**
 * The configs, with the choices `configs.*` fixes made by you:
 * `createConfig({ ignores: ["src/components/ui/vendor/**"] })`.
 */
function createConfig({
  ignores = INSTALLED_COMPONENTS,
  tailwind: withTailwind = true,
}: ConfigOptions = {}): TSESLint.FlatConfig.Config[] {
  return withTailwind ? [core(ignores), tailwind(ignores)] : [core(ignores)]
}

plugin.configs = {
  core: createConfig({ tailwind: false }),
  tailwind: [tailwind(INSTALLED_COMPONENTS)],
  recommended: createConfig(),
}

export default plugin
