import type { ComponentProps } from "react"

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import type { Args, Story } from "@/site/playground/types"

type ButtonProps = ComponentProps<typeof QuestionnaireNext>

function shape(args: Args) {
  const shortcuts = String(args.shortcuts)
  return {
    shortcuts:
      shortcuts === "none" ? undefined : (shortcuts as "letters" | "numbers"),
    title: String(args.title),
    description: Boolean(args.description),
    multiple: Boolean(args.multiple),
    required: Boolean(args.required),
    invalid: Boolean(args.invalid),
    disabled: Boolean(args.disabled),
    variant: String(args.variant) as NonNullable<ButtonProps["variant"]>,
    size: String(args.size) as NonNullable<ButtonProps["size"]>,
  }
}

function QuestionnaireStory({ args }: { args: Args }) {
  const s = shape(args)
  const button = {
    variant: s.variant,
    size: s.size,
  }
  return (
    <Questionnaire
      shortcuts={s.shortcuts}
      onSubmit={(event) => event.preventDefault()}
      className="max-w-md"
    >
      <QuestionnaireProgress />
      <QuestionnaireItem
        name="audience"
        multiple={s.multiple}
        required={s.required}
        invalid={s.invalid}
      >
        <QuestionnaireTitle>{s.title}</QuestionnaireTitle>
        {s.description ? (
          <QuestionnaireDescription>
            Pick the group that reads it most.
          </QuestionnaireDescription>
        ) : null}
        <QuestionnaireChoices>
          <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
          <QuestionnaireChoice value="board">
            The board
            <QuestionnaireChoiceDescription>
              A one-page summary for the quarterly meeting.
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="customers" disabled={s.disabled}>
            Our customers
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="length" required>
        <QuestionnaireTitle>How long should it be?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="page">One page</QuestionnaireChoice>
          <QuestionnaireChoice value="full">Full report</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="notes">
        <QuestionnaireTitle>Anything else we should know?</QuestionnaireTitle>
        <QuestionnaireInput placeholder="A note for the writer" />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext {...button} />
        <QuestionnaireSubmit {...button} />
      </QuestionnaireActions>
    </Questionnaire>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const item = [
    'name="audience"',
    ...(s.multiple ? ["multiple"] : []),
    ...(s.required ? ["required"] : []),
    ...(s.invalid ? ["invalid"] : []),
  ]
  const button = [
    ...(s.variant === "default" ? [] : [`variant="${s.variant}"`]),
    ...(s.size === "default" ? [] : [`size="${s.size}"`]),
  ]
  const attrs = (list: string[]) => list.map((prop) => ` ${prop}`).join("")
  return [
    "import {",
    "  Questionnaire,",
    "  QuestionnaireActions,",
    "  QuestionnaireChoice,",
    "  QuestionnaireChoiceDescription,",
    "  QuestionnaireChoices,",
    ...(s.description ? ["  QuestionnaireDescription,"] : []),
    "  QuestionnaireError,",
    "  QuestionnaireInput,",
    "  QuestionnaireItem,",
    "  QuestionnaireNext,",
    "  QuestionnairePrevious,",
    "  QuestionnaireProgress,",
    "  QuestionnaireSkip,",
    "  QuestionnaireSubmit,",
    "  QuestionnaireTitle,",
    '} from "@/components/ui/questionnaire"',
    "",
    "export function Example() {",
    "  return (",
    "    <Questionnaire",
    ...(s.shortcuts ? [`      shortcuts="${s.shortcuts}"`] : []),
    "      onSubmit={(event) => event.preventDefault()}",
    '      className="max-w-md"',
    "    >",
    "      <QuestionnaireProgress />",
    `      <QuestionnaireItem${attrs(item)}>`,
    `        <QuestionnaireTitle>${s.title}</QuestionnaireTitle>`,
    ...(s.description
      ? [
          "        <QuestionnaireDescription>",
          "          Pick the group that reads it most.",
          "        </QuestionnaireDescription>",
        ]
      : []),
    "        <QuestionnaireChoices>",
    '          <QuestionnaireChoice value="team">My team</QuestionnaireChoice>',
    '          <QuestionnaireChoice value="board">',
    "            The board",
    "            <QuestionnaireChoiceDescription>",
    "              A one-page summary for the quarterly meeting.",
    "            </QuestionnaireChoiceDescription>",
    "          </QuestionnaireChoice>",
    `          <QuestionnaireChoice value="customers"${s.disabled ? " disabled" : ""}>`,
    "            Our customers",
    "          </QuestionnaireChoice>",
    "        </QuestionnaireChoices>",
    "        <QuestionnaireError />",
    "      </QuestionnaireItem>",
    '      <QuestionnaireItem name="length" required>',
    "        <QuestionnaireTitle>How long should it be?</QuestionnaireTitle>",
    "        <QuestionnaireChoices>",
    '          <QuestionnaireChoice value="page">One page</QuestionnaireChoice>',
    '          <QuestionnaireChoice value="full">Full report</QuestionnaireChoice>',
    "        </QuestionnaireChoices>",
    "      </QuestionnaireItem>",
    '      <QuestionnaireItem name="notes">',
    "        <QuestionnaireTitle>Anything else we should know?</QuestionnaireTitle>",
    '        <QuestionnaireInput placeholder="A note for the writer" />',
    "      </QuestionnaireItem>",
    "      <QuestionnaireActions>",
    "        <QuestionnairePrevious />",
    "        <QuestionnaireSkip />",
    `        <QuestionnaireNext${attrs(button)} />`,
    `        <QuestionnaireSubmit${attrs(button)} />`,
    "      </QuestionnaireActions>",
    "    </Questionnaire>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Questionnaire: three questions asked one at a time, about a report. The
 * item controls act on the first question (`multiple` turns its radios into
 * checkboxes, `required` hides Skip, `invalid` draws the error state,
 * `disabled` turns off its last choice: on the item, it would drop the whole
 * question from the flow); `shortcuts` labels the choices; `variant` and
 * `size` are the Next and Submit buttons'. Each change restarts the form,
 * since the primitive only shows the current question.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "shortcuts",
      options: ["none", "letters", "numbers"],
      default: "none",
    },
    { kind: "text", name: "title", default: "Who is the report for?" },
    { kind: "boolean", name: "description", default: true },
    { kind: "boolean", name: "multiple", default: false },
    { kind: "boolean", name: "required", default: false },
    { kind: "boolean", name: "invalid", default: false },
    { kind: "boolean", name: "disabled", default: false },
    {
      kind: "select",
      name: "variant",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
      default: "default",
    },
    {
      kind: "select",
      name: "size",
      options: ["xs", "sm", "default", "lg"],
      default: "default",
    },
  ],
  render: (args) => (
    <QuestionnaireStory key={JSON.stringify(args)} args={args} />
  ),
  code,
  layout: "padded",
}

export default story
