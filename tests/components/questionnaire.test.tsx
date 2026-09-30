import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { userEvent as browserUser } from "vitest/browser"

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

function Survey({
  onAnswers,
  shortcuts,
}: {
  onAnswers?: (a: object) => void
  shortcuts?: "letters" | "numbers"
}) {
  return (
    <Questionnaire
      shortcuts={shortcuts}
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
  it("accessible name: the progress bar and the buttons are named from UI_STRINGS", async () => {
    const user = userEvent.setup()
    render(<Survey />)
    expect(
      screen.getByRole("progressbar", {
        name: UI_STRINGS.questionnaire.progress,
      })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.next })
    ).toBeTruthy()

    await user.click(screen.getByRole("radio", { name: "The board" }))
    await user.click(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.next })
    )
    for (const name of [
      UI_STRINGS.questionnaire.previous,
      UI_STRINGS.questionnaire.skip,
      UI_STRINGS.questionnaire.submit,
    ]) {
      expect(screen.getByRole("button", { name })).toBeTruthy()
    }
  })

  it("names its progress bar from aria-label and its buttons from children", () => {
    render(
      <Questionnaire>
        <QuestionnaireProgress aria-label="Survey progress" />
        <QuestionnaireItem name="audience">
          <QuestionnaireTitle>Who is the report for?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSubmit>Send answers</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    )
    expect(
      screen.getByRole("progressbar", { name: "Survey progress" })
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Send answers" })).toBeTruthy()
  })

  it("role: a form of fieldsets named by their legend, native radios and a progress bar", () => {
    const { container } = render(<Survey />)
    expect(container.querySelector("[data-slot=questionnaire]")?.tagName).toBe(
      "FORM"
    )
    const item = screen.getByRole("group", { name: "Who is the report for?" })
    expect(item.tagName).toBe("FIELDSET")
    const radio = within(item).getByRole("radio", { name: "My team" })
    expect(radio.tagName).toBe("INPUT")
    expect(radio.getAttribute("type")).toBe("radio")
    const progress = screen.getByRole("progressbar")
    expect(progress.getAttribute("aria-valuetext")).toBe("Question 1 of 2")
  })

  it("ArrowUp/ArrowDown: moves between the choices of the current question", async () => {
    render(<Survey />)
    const team = screen.getByRole("radio", { name: "My team" })
    const board = screen.getByRole("radio", { name: "The board" })
    await browserUser.click(team)
    await browserUser.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(board)
    expect(board).toHaveProperty("checked", true)
    await browserUser.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(team)
    expect(team).toHaveProperty("checked", true)
  })

  it("Space: checks the focused choice", async () => {
    render(<Survey />)
    const board = screen.getByRole("radio", { name: "The board" })
    board.focus()
    expect(board).toHaveProperty("checked", false)
    await browserUser.keyboard(" ")
    expect(board).toHaveProperty("checked", true)
  })

  it("Enter: on a checked choice: goes to the next question", async () => {
    render(<Survey />)
    const board = screen.getByRole("radio", { name: "The board" })
    board.focus()
    // Unchecked, the choice stays where it is: Enter does not check it.
    await browserUser.keyboard("{Enter}")
    expect(board).toHaveProperty("checked", false)
    expect(
      screen.queryByRole("group", { name: "How long should it be?" })
    ).toBeNull()
    await browserUser.keyboard(" ")
    expect(board).toHaveProperty("checked", true)
    await browserUser.keyboard("{Enter}")
    await expect
      .poll(() =>
        screen.queryByRole("group", { name: "How long should it be?" })
      )
      .not.toBeNull()
  })

  it("ArrowLeft: goes back to the previous question", async () => {
    render(<Survey />)
    await browserUser.click(screen.getByRole("radio", { name: "The board" }))
    await browserUser.click(
      screen.getByRole("button", { name: UI_STRINGS.questionnaire.next })
    )
    const second = screen.getByRole("group", { name: "How long should it be?" })
    await expect.poll(() => document.activeElement).toBe(second)
    await browserUser.keyboard("{ArrowLeft}")
    await expect
      .poll(() =>
        screen.queryByRole("group", { name: "Who is the report for?" })
      )
      .not.toBeNull()
    expect(
      screen.queryByRole("group", { name: "How long should it be?" })
    ).toBeNull()
  })

  it("ArrowRight: goes to the next question, once the current one is answered", async () => {
    render(<Survey />)
    const first = screen.getByRole("group", { name: "Who is the report for?" })
    first.focus()
    await browserUser.keyboard("{ArrowRight}")
    expect(
      screen.queryByRole("group", { name: "How long should it be?" })
    ).toBeNull()

    await browserUser.click(screen.getByRole("radio", { name: "The board" }))
    first.focus()
    await browserUser.keyboard("{ArrowRight}")
    await expect
      .poll(() =>
        screen.queryByRole("group", { name: "How long should it be?" })
      )
      .not.toBeNull()
  })

  it("A…Z / 1…9: with shortcuts: checks the choice labeled with that key", async () => {
    const { unmount } = render(<Survey shortcuts="letters" />)
    screen.getByRole("group", { name: "Who is the report for?" }).focus()
    await browserUser.keyboard("b")
    expect(screen.getByRole("radio", { name: /The board/ })).toHaveProperty(
      "checked",
      true
    )
    unmount()

    render(<Survey shortcuts="numbers" />)
    screen.getByRole("group", { name: "Who is the report for?" }).focus()
    await browserUser.keyboard("1")
    expect(screen.getByRole("radio", { name: /My team/ })).toHaveProperty(
      "checked",
      true
    )
  })

  it("Ctrl+Enter/⌘+Enter: goes on, or submits on the last question", async () => {
    const onAnswers = vi.fn()
    render(<Survey onAnswers={onAnswers} />)
    await browserUser.click(screen.getByRole("radio", { name: "The board" }))
    await browserUser.keyboard("{Control>}{Enter}{/Control}")
    await expect
      .poll(() =>
        screen.queryByRole("group", { name: "How long should it be?" })
      )
      .not.toBeNull()
    expect(onAnswers).not.toHaveBeenCalled()

    await browserUser.click(screen.getByRole("radio", { name: "One page" }))
    await browserUser.keyboard("{Meta>}{Enter}{/Meta}")
    await expect.poll(() => onAnswers.mock.calls.length).toBe(1)
    expect(onAnswers).toHaveBeenCalledWith({
      audience: "board",
      length: "page",
    })
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
