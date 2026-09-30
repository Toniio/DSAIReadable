import type { TSESLint } from "@typescript-eslint/utils"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import { DEPRECATED_IMPORTS } from "./deprecations.js"
import noClassInterpolation from "./rules/no-class-interpolation.js"
import noDeprecatedImports from "./rules/no-deprecated-imports.js"
import noExternalUiImports from "./rules/no-external-ui-imports.js"
import noInlineSvg from "./rules/no-inline-svg.js"
import noNativeInteractiveElements from "./rules/no-native-interactive-elements.js"
import noRawValues from "./rules/no-raw-values.js"

const rules = {
  "no-class-interpolation": noClassInterpolation,
  "no-deprecated-imports": noDeprecatedImports,
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

const plugin = {
  meta: { name: "@dsaireadable/eslint-plugin" },
  rules,
  configs: {} as Record<string, TSESLint.FlatConfig.Config[]>,
} satisfies TSESLint.FlatConfig.Plugin

/**
 * The rules that read the code alone: no stylesheet, no Tailwind, no disk.
 * `dsaireadable_validate_code` runs exactly these.
 */
const core: TSESLint.FlatConfig.Config = {
  name: "dsaireadable/core",
  files: SOURCE_FILES,
  ignores: INSTALLED_COMPONENTS,
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
  },
}

/**
 * The Tailwind half of the lockdown, which does read the real stylesheet:
 * `styles/globals.css` removes Tailwind's default colors, radii, shadows,
 * spacing and type scale, so `bg-red-500` or `p-13` generate no CSS, and this
 * turns the same class into an error before it ships. Point
 * `settings["better-tailwindcss"].entryPoint` at your stylesheet if it is not
 * `styles/globals.css`.
 */
const tailwind: TSESLint.FlatConfig.Config = {
  name: "dsaireadable/tailwind",
  files: SOURCE_FILES,
  ignores: INSTALLED_COMPONENTS,
  plugins: {
    "better-tailwindcss":
      betterTailwindcss as unknown as TSESLint.FlatConfig.Plugin,
  },
  settings: { "better-tailwindcss": { entryPoint: "styles/globals.css" } },
  rules: {
    "better-tailwindcss/no-unknown-classes": "error",
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
}

plugin.configs = {
  core: [core],
  tailwind: [tailwind],
  recommended: [core, tailwind],
}

export default plugin
