import { Fragment, useState } from "react"
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import type { Args, Story } from "@/site/playground/types"

/** The `pattern` options, by the name of the constant `input-otp` exports. */
const PATTERNS: Record<string, { name: string; value: string } | undefined> = {
  none: undefined,
  digits: { name: "REGEXP_ONLY_DIGITS", value: REGEXP_ONLY_DIGITS },
  "digits-and-chars": {
    name: "REGEXP_ONLY_DIGITS_AND_CHARS",
    value: REGEXP_ONLY_DIGITS_AND_CHARS,
  },
}

function shape(args: Args) {
  const length = Number(args.maxLength)
  const half = length / 2
  return {
    length,
    groups: args.separator
      ? [
          Array.from({ length: half }, (_, index) => index),
          Array.from({ length: half }, (_, index) => half + index),
        ]
      : [Array.from({ length }, (_, index) => index)],
    pattern: PATTERNS[String(args.pattern)],
    value: String(args.value).slice(0, length),
    disabled: Boolean(args.disabled),
    invalid: Boolean(args["aria-invalid"]),
  }
}

function InputOtpStory({ args }: { args: Args }) {
  const s = shape(args)
  const [value, setValue] = useState(s.value)
  return (
    <InputOTP
      maxLength={s.length}
      pattern={s.pattern?.value}
      value={value}
      onChange={setValue}
      disabled={s.disabled}
      aria-label="Verification code"
      autoComplete="one-time-code"
    >
      {s.groups.map((group, position) => (
        <Fragment key={group[0]}>
          {position > 0 ? <InputOTPSeparator /> : null}
          <InputOTPGroup>
            {group.map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                aria-invalid={s.invalid || undefined}
              />
            ))}
          </InputOTPGroup>
        </Fragment>
      ))}
    </InputOTP>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const props = [
    `maxLength={${s.length}}`,
    ...(s.pattern ? [`pattern={${s.pattern.name}}`] : []),
    ...(s.value ? ["value={value}", "onChange={setValue}"] : []),
    ...(s.disabled ? ["disabled"] : []),
    'aria-label="Verification code"',
    'autoComplete="one-time-code"',
  ]
  const slot = (index: number) =>
    `        <InputOTPSlot index={${index}}${s.invalid ? " aria-invalid" : ""} />`
  const groups = s.groups.flatMap((group, position) => [
    ...(position > 0 ? ["      <InputOTPSeparator />"] : []),
    "      <InputOTPGroup>",
    ...group.map(slot),
    "      </InputOTPGroup>",
  ])
  const parts = [
    "InputOTP",
    "InputOTPGroup",
    ...(s.groups.length > 1 ? ["InputOTPSeparator"] : []),
    "InputOTPSlot",
  ]
  return [
    ...(s.value
      ? ['"use client"', "", 'import { useState } from "react"']
      : []),
    ...(s.pattern ? [`import { ${s.pattern.name} } from "input-otp"`] : []),
    ...(s.value || s.pattern ? [""] : []),
    "import {",
    ...parts.map((part) => `  ${part},`),
    '} from "@/components/ui/input-otp"',
    "",
    "export function Example() {",
    ...(s.value
      ? [`  const [value, setValue] = useState(${JSON.stringify(s.value)})`]
      : []),
    "  return (",
    "    <InputOTP",
    ...props.map((prop) => `      ${prop}`),
    "    >",
    ...groups,
    "    </InputOTP>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * InputOtp: a code of 4, 6 or 8 slots, split in two groups or not, limited
 * to digits by `pattern`, filled with a starting `value` (controlled: the
 * library passes a `defaultValue` on to its input beside `value`).
 * `aria-invalid` goes on every slot: set on `InputOTP`, it draws nothing.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "maxLength",
      options: ["4", "6", "8"],
      default: "6",
      numeric: true,
    },
    {
      kind: "select",
      name: "pattern",
      options: ["none", "digits", "digits-and-chars"],
      default: "none",
    },
    { kind: "text", name: "value", default: "" },
    { kind: "boolean", name: "separator", default: true },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "aria-invalid", default: false },
  ],
  render: (args) => (
    <InputOtpStory key={`${args.maxLength}-${args.value}`} args={args} />
  ),
  code,
}

export default story
