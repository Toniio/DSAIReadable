/**
 * Each rule against a failing fixture and a conforming one, then the configs
 * against a whole file. A rule never seen failing may detect nothing.
 *
 *   npm test -w @dsaireadable/eslint-plugin
 */
import tsParser from "@typescript-eslint/parser"
import { Linter, RuleTester } from "eslint"
import assert from "node:assert/strict"
import { describe, it } from "node:test"
import plugin from "./index.js"
import noClassInterpolation from "./rules/no-class-interpolation.js"
import noDeprecatedImports from "./rules/no-deprecated-imports.js"
import noExternalUiImports from "./rules/no-external-ui-imports.js"
import noInlineSvg from "./rules/no-inline-svg.js"
import noNativeInteractiveElements from "./rules/no-native-interactive-elements.js"
import noRawValues from "./rules/no-raw-values.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

// The rules are typed for typescript-eslint; RuleTester wants ESLint's own type.
const asEslint = (rule: unknown) => rule as never

tester.run(
  "no-native-interactive-elements",
  asEslint(noNativeInteractiveElements),
  {
    valid: [
      `const a = <Button>Save</Button>`,
      `const a = <Input name="email" />`,
      `const a = <Label htmlFor="x">Name</Label>`,
      // A Button with asChild renders its child: that is how a link keeps the look.
      `const a = <Button asChild><a href="/docs">Docs</a></Button>`,
      `const a = <div role="button" />`,
    ],
    invalid: [
      {
        code: `const a = <button onClick={go}>Go</button>`,
        errors: [
          {
            messageId: "native",
            data: {
              tag: "button",
              component: "Button (`@/components/ui/button`)",
            },
          },
        ],
      },
      {
        code: `const a = <input name="email" />`,
        errors: [{ messageId: "native" }],
      },
      {
        code: `const a = <select><option /></select>`,
        errors: [{ messageId: "native" }],
      },
      { code: `const a = <textarea />`, errors: [{ messageId: "native" }] },
      {
        code: `const a = <label htmlFor="x">Name</label>`,
        errors: [{ messageId: "native" }],
      },
      { code: `const a = <table />`, errors: [{ messageId: "native" }] },
      { code: `const a = <dialog />`, errors: [{ messageId: "native" }] },
      {
        code: `const a = <a href="/docs">Docs</a>`,
        errors: [{ messageId: "native" }],
      },
      // asChild on an ancestor further up does not make a nested <a> valid.
      {
        code: `const a = <Button asChild><span><a href="/x" /></span></Button>`,
        errors: [{ messageId: "native" }],
      },
    ],
  }
)

tester.run("no-external-ui-imports", asEslint(noExternalUiImports), {
  valid: [
    `import { Button } from "@/components/ui/button"`,
    `import { Plus } from "@phosphor-icons/react"`,
    `import { useState } from "react"`,
    {
      code: `import { Button } from "~/components/ui/button"`,
      options: [{ allowedOrigins: ["~/components/ui/"] }],
    },
  ],
  invalid: [
    {
      code: `import { Plus } from "lucide-react"`,
      errors: [{ messageId: "icons" }],
    },
    {
      code: `import { Plus } from "lucide-react/dist/esm/icons/plus"`,
      errors: [{ messageId: "icons" }],
    },
    {
      code: `import { X } from "@heroicons/react/24/solid"`,
      errors: [{ messageId: "icons" }],
    },
    {
      code: `import * as Dialog from "@radix-ui/react-dialog"`,
      errors: [{ messageId: "library" }],
    },
    {
      code: `import { Dialog } from "radix-ui"`,
      errors: [{ messageId: "library" }],
    },
    {
      code: `import { Menu } from "@base-ui/react/menu"`,
      errors: [{ messageId: "library" }],
    },
    {
      code: `import { Button } from "@mui/material"`,
      errors: [{ messageId: "library" }],
    },
    {
      code: `export { Plus } from "lucide-react"`,
      errors: [{ messageId: "icons" }],
    },
    {
      code: `export * from "@radix-ui/react-tabs"`,
      errors: [{ messageId: "library" }],
    },
    {
      code: `import { Button } from "../components/ui/button"`,
      errors: [{ messageId: "origin" }],
    },
    {
      code: `import { Button } from "@acme/design-system"`,
      errors: [{ messageId: "origin" }],
    },
    {
      code: `import { Button } from "@/components/ui/button"`,
      options: [{ allowedOrigins: ["~/components/ui/"] }],
      errors: [{ messageId: "origin" }],
    },
  ],
})

tester.run("no-inline-svg", asEslint(noInlineSvg), {
  valid: [`const a = <Plus />`, `const a = <Icon name="svg" />`],
  invalid: [
    {
      code: `const a = <svg viewBox="0 0 1 1"><path d="M0 0" /></svg>`,
      errors: [{ messageId: "svg" }],
    },
  ],
})

tester.run("no-class-interpolation", asEslint(noClassInterpolation), {
  valid: [
    "const a = <div className={`px-2 ${FOCUS_RING}`} />",
    "const a = cn(`px-2 ${variant} py-1`)",
    'const a = <div className="px-2" />',
    // Not a class context: a template is only a string there.
    "const a = `text-${color}`",
  ],
  invalid: [
    {
      code: "const a = <div className={`text-${color}`} />",
      errors: [{ messageId: "interpolation" }],
    },
    {
      code: "const a = <div className={`${size}-4`} />",
      errors: [{ messageId: "interpolation" }],
    },
    {
      code: "const a = cn(`[&>*]:${color}`)",
      errors: [{ messageId: "interpolation" }],
    },
    {
      code: "const a = clsx(`bg-${tone}`)",
      errors: [{ messageId: "interpolation" }],
    },
    {
      code: "const a = <Box iconClassName={`size-${n}`} />",
      errors: [{ messageId: "interpolation" }],
    },
  ],
})

tester.run("no-raw-values", asEslint(noRawValues), {
  valid: [
    `const a = <div className="bg-primary text-primary-foreground p-4 dark:bg-muted" />`,
    `const a = <div className="data-[state=open]:bg-accent [&>svg]:size-4" />`,
    `const a = <div className="w-(--anchor-width) bg-black/10 bg-white" />`,
    `const a = cn("rounded-md", open && "opacity-disabled")`,
    // A hex-looking string that is not written as a style.
    `const a = <a href="#add">Add</a>`,
    `const a = { color: "#fff" }`,
    `const a = <div style={{ width: "var(--sidebar-width)" }} />`,
  ],
  invalid: [
    {
      code: `const a = <div className="bg-[#432dd7]" />`,
      errors: [{ messageId: "hex", data: { value: "#432dd7" } }],
    },
    {
      code: `const a = <div style={{ color: "#fff" }} />`,
      errors: [{ messageId: "hex" }],
    },
    {
      code: `const a = <div style={{ color: "rgb(0, 0, 0)" }} />`,
      errors: [{ messageId: "colorFunction", data: { value: "rgb()" } }],
    },
    {
      code: `const a = <div className="bg-[oklch(0.5_0.2_250)]" />`,
      errors: [{ messageId: "colorFunction" }],
    },
    {
      code: `const a = <div className="bg-violet-600 hover:text-red-500" />`,
      errors: [
        { messageId: "palette", data: { value: "bg-violet-600" } },
        { messageId: "palette", data: { value: "text-red-500" } },
      ],
    },
    {
      code: `const a = cn("dark:hover:border-slate-200/50")`,
      errors: [{ messageId: "palette" }],
    },
    {
      code: `const a = <div className="p-[1.5rem] hover:rounded-[0.625rem]" />`,
      errors: [
        { messageId: "arbitrary", data: { value: "p-[1.5rem]" } },
        { messageId: "arbitrary", data: { value: "rounded-[0.625rem]" } },
      ],
    },
    {
      code: `const a = <div className="duration-[300ms]" />`,
      errors: [{ messageId: "arbitrary" }],
    },
    {
      code: `const a = <div style={{ padding: "12px" }} />`,
      errors: [{ messageId: "unit", data: { value: "12px" } }],
    },
    {
      code: `const a = <div style={{ color: "var(--ds-prim-color-violet-600)" }} />`,
      errors: [{ messageId: "primitive" }],
    },
    {
      code: `const a = "text-[var(--ds-prim-color-violet-600)]"`,
      errors: [{ messageId: "primitive" }],
    },
    {
      code: `const a = matchMedia("(prefers-color-scheme: dark)")`,
      errors: [{ messageId: "mediaDark" }],
    },
  ],
})

tester.run("no-deprecated-imports", asEslint(noDeprecatedImports), {
  valid: [
    {
      code: `import { Button } from "@/components/ui/button"`,
      options: [{ modules: {} }],
    },
    `import { Button } from "@/components/ui/button"`,
    {
      code: `import { Card } from "@/components/ui/card"`,
      options: [
        { modules: { "@/components/ui/card#CardHeading": "use CardTitle" } },
      ],
    },
  ],
  invalid: [
    {
      code: `import { Toast } from "@/components/ui/toast"`,
      options: [{ modules: { "@/components/ui/toast": "use Sonner" } }],
      errors: [
        {
          messageId: "deprecated",
          data: { name: "@/components/ui/toast", reason: "use Sonner" },
        },
      ],
    },
    {
      code: `import { Card, CardHeading } from "@/components/ui/card"`,
      options: [
        { modules: { "@/components/ui/card#CardHeading": "use CardTitle" } },
      ],
      errors: [
        {
          messageId: "deprecated",
          data: {
            name: "@/components/ui/card#CardHeading",
            reason: "use CardTitle",
          },
        },
      ],
    },
  ],
})

describe("the configs", () => {
  const lint = (code: string, filename: string) =>
    new Linter().verify(
      code,
      [
        {
          files: ["**/*.tsx"],
          languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
        },
        ...(plugin.configs.core as never[]),
      ],
      { filename }
    )

  it("lists every rule in core, as an error", () => {
    const core = plugin.configs.core[0]
    for (const name of Object.keys(plugin.rules))
      assert.ok(
        core.rules?.[`dsaireadable/${name}`],
        `core does not enable ${name}`
      )
  })

  it("reports a violating file rule by rule", () => {
    const messages = lint(
      `import { Plus } from "lucide-react"
export const A = () => <button className="bg-[#fff] text-red-500">{<Plus />}</button>`,
      "src/screen.tsx"
    )
    assert.deepEqual(messages.map((m) => m.ruleId).sort(), [
      "dsaireadable/no-external-ui-imports",
      "dsaireadable/no-native-interactive-elements",
      "dsaireadable/no-raw-values",
      "dsaireadable/no-raw-values",
    ])
  })

  it("passes a conforming file", () => {
    const messages = lint(
      `import { Plus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
export const A = () => <Button className="bg-primary p-4"><Plus /></Button>`,
      "src/screen.tsx"
    )
    assert.deepEqual(messages, [])
  })

  it("lints your own files in components/ui once ignores says so", () => {
    const lintWith = (ignores: string[]) =>
      new Linter().verify(
        `export const B = () => <button />`,
        [
          {
            files: ["**/*.tsx"],
            languageOptions: {
              parser: tsParser,
              parserOptions: { ecmaFeatures: { jsx: true } },
            },
          },
          ...(plugin.createConfig({ ignores, tailwind: false }) as never[]),
        ],
        { filename: "components/ui/mine/card.tsx" }
      )
    assert.equal(lintWith(["**/components/ui/vendor/**"]).length, 1)
    assert.equal(lintWith(["**/components/ui/mine/**"]).length, 0)
    assert.equal(lintWith([]).length, 1)
  })

  it("leaves the installed components alone", () => {
    const messages = lint(
      `export const B = () => <button className="bg-[#fff]" />`,
      "components/ui/button.tsx"
    )
    assert.deepEqual(messages, [])
  })
})
