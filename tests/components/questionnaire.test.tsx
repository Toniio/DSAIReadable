import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { UI_STRINGS } from "@/lib/ui-strings"

import { axeViolations } from "../axe"

function Survey({ onAnswers }: { onAnswers?: (a: object) => void }) {
  return (
    <Questionnaire
      onSubmit={(event) => {
        event.preventDefault()
        onAnswers?.(Object.fromEntries(new FormData(event.currentTarget)))
      }}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="audience" required>
        <QuestionnaireTitle>Who is the report for?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
          <QuestionnaireChoice value="board">The board</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="length">
        <QuestionnaireTitle>How long should it be?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="page">One page</QuestionnaireChoice>
          <QuestionnaireChoice value="full">Full report</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}

describe("Questionnaire", () => {
  it("names its progress bar and its buttons from UI_STRINGS", () => {
    render(<Survey />)
    expect(
      screen.getByRole("progressbar", {
        name: UI_STRINGS.questionnaire.progress,
      })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.next })
    ).toBeTruthy()
  })

  it("asks one question at a time, as a group of radio buttons", async () => {
    const user = userEvent.setup()
    render(<Survey />)
    const first = screen.getByRole("group", { name: "Who is the report for?" })
    expect(screen.getAllByRole("radio", { name: /team|board/ })).toHaveLength(2)
    expect(first).toBeTruthy()

    await user.click(screen.getByRole("radio", { name: "The board" }))
    await user.click(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.next })
    )
    expect(
      screen.getByRole("group", { name: "How long should it be?" })
    ).toBeTruthy()
  })

  it("submits the answers under each question's name", async () => {
    const user = userEvent.setup()
    let answers: object | undefined
    render(<Survey onAnswers={(a) => (answers = a)} />)
    await user.click(screen.getByRole("radio", { name: "The board" }))
    await user.click(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.next })
    )
    await user.click(screen.getByRole("radio", { name: "One page" }))
    await user.click(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.submit })
    )
    expect(answers).toEqual({ audience: "board", length: "page" })
  })

  it("has no axe violation", async () => {
    render(<Survey />)
    expect(await axeViolations()).toEqual([])
  })
})
