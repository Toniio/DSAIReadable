import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { Button } from "@/components/ui/button"
import { UI_STRINGS } from "@/lib/ui-strings"

import { borderPaint, ringOf, unmarkedTabStops } from "../focus"

const code = "npm install @dsaireadable/eslint-plugin"
const long = `const message = "${"a long line of output ".repeat(20)}"`

function WithHeader({ copyLabel }: { copyLabel?: string }) {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>Terminal</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} copyLabel={copyLabel} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{code}</CodeBlockContent>
    </CodeBlock>
  )
}

function Floating() {
  return (
    <CodeBlock>
      <CodeBlockActions>
        <CodeBlockCopyButton value={code} />
      </CodeBlockActions>
      <CodeBlockContent>{code}</CodeBlockContent>
    </CodeBlock>
  )
}

/** Replaces the browser's clipboard, which a headless page may not grant. */
function stubClipboard() {
  const writeText = vi.fn<(text: string) => Promise<void>>(() =>
    Promise.resolve()
  )
  vi.spyOn(navigator, "clipboard", "get").mockReturnValue({
    writeText,
  } as unknown as Clipboard)
  return writeText
}

/** Resolves once the element's scroll position has held for five frames. */
async function scrollEnded(element: HTMLElement) {
  let last = element.scrollLeft
  for (let still = 0; still < 5;) {
    await new Promise(requestAnimationFrame)
    still = element.scrollLeft === last ? still + 1 : 0
    last = element.scrollLeft
  }
}

const liveRegion = () =>
  document.querySelector<HTMLElement>('[data-slot="code-block"] [aria-live]')!

afterEach(() => {
  vi.restoreAllMocks()
})

describe("CodeBlock", () => {
  it("role: a pre holding a code element, left to right and a tab stop, and a native button followed by a polite live region", () => {
    render(<WithHeader />)
    const content = document.querySelector<HTMLElement>(
      '[data-slot="code-block-content"]'
    )!
    expect(content.tagName).toBe("PRE")
    expect(content.getAttribute("role")).toBeNull()
    expect(content.dir).toBe("ltr")
    expect(content.tabIndex).toBe(0)
    expect(content.firstElementChild?.tagName).toBe("CODE")

    const button = screen.getByRole("button", {
      name: UI_STRINGS.codeBlock.copy,
    })
    expect(button.tagName).toBe("BUTTON")
    expect(button.dataset.slot).toBe("code-block-copy-button")
    expect(button.dataset.variant).toBe("ghost")
    expect(button.dataset.size).toBe("icon-xs")
    expect(liveRegion().getAttribute("aria-live")).toBe("polite")
    expect(liveRegion().textContent).toBe("")
  })

  it("accessible name: the button is named by UI_STRINGS.codeBlock.copy, or by copyLabel", () => {
    const { unmount } = render(<WithHeader />)
    expect(
      screen.getByRole("button", { name: UI_STRINGS.codeBlock.copy })
    ).toBeTruthy()
    unmount()

    render(<WithHeader copyLabel="Copy the install command" />)
    expect(
      screen.getByRole("button", { name: "Copy the install command" })
    ).toBeTruthy()
    expect(
      screen.queryByRole("button", { name: UI_STRINGS.codeBlock.copy })
    ).toBeNull()
  })

  it("Tab: moves to the copy button, then to the code; floating actions show while focus is in the block", async () => {
    render(<Floating />)
    const actions = document.querySelector<HTMLElement>(
      '[data-slot="code-block-actions"]'
    )!
    expect(getComputedStyle(actions).opacity).toBe("0")

    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: UI_STRINGS.codeBlock.copy })
    )
    expect(getComputedStyle(actions).opacity).toBe("1")

    await userEvent.tab()
    expect(document.activeElement?.getAttribute("data-slot")).toBe(
      "code-block-content"
    )
    expect(getComputedStyle(actions).opacity).toBe("1")
  })

  it("Enter / Space: on the copy button, copies value, renames the button Copied and announces it", async () => {
    const writeText = stubClipboard()
    render(<WithHeader copyLabel="Copy the install command" />)
    screen.getByRole("button", { name: "Copy the install command" }).focus()

    await userEvent.keyboard("{Enter}")
    expect(writeText).toHaveBeenCalledWith(code)
    const copied = await screen.findByRole("button", {
      name: UI_STRINGS.codeBlock.copied,
    })
    expect(copied.dataset.copied).toBe("true")
    expect(liveRegion().textContent).toBe(UI_STRINGS.codeBlock.copied)

    await userEvent.keyboard(" ")
    expect(writeText).toHaveBeenCalledTimes(2)
    expect(writeText).toHaveBeenLastCalledWith(code)
  })

  it("ArrowLeft / ArrowRight: on the code, scrolls a long line horizontally, natively", async () => {
    render(
      <div className="w-64">
        <CodeBlock>
          <CodeBlockContent>{long}</CodeBlockContent>
        </CodeBlock>
      </div>
    )
    const content = document.querySelector<HTMLElement>(
      '[data-slot="code-block-content"]'
    )!
    expect(content.scrollWidth).toBeGreaterThan(content.clientWidth)
    content.focus()
    expect(content.scrollLeft).toBe(0)

    await userEvent.keyboard("{ArrowRight}")
    await expect
      .poll(() => content.scrollLeft, { timeout: 5000 })
      .toBeGreaterThan(0)
    // The keyboard scrolls smoothly: let it end before scrolling back, or a
    // busy machine presses ArrowLeft while the first scroll still runs.
    await scrollEnded(content)
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(() => content.scrollLeft, { timeout: 5000 }).toBe(0)
  })

  it("copiedLabel replaces the name and the announcement after a copy", async () => {
    stubClipboard()
    render(
      <CodeBlock>
        <CodeBlockActions>
          <CodeBlockCopyButton
            value={code}
            copyLabel="Copy the command"
            copiedLabel="Command copied"
          />
        </CodeBlockActions>
        <CodeBlockContent>{code}</CodeBlockContent>
      </CodeBlock>
    )
    await userEvent.click(
      screen.getByRole("button", { name: "Copy the command" })
    )
    expect(
      await screen.findByRole("button", { name: "Command copied" })
    ).toBeTruthy()
    expect(liveRegion().textContent).toBe("Command copied")
  })

  it("lineNumbers splits a string into lines numbered from startLine, which a copy leaves out", () => {
    render(
      <CodeBlock>
        <CodeBlockContent lineNumbers startLine={12}>
          {"const a = 1\n\nconst b = 2\n"}
        </CodeBlockContent>
      </CodeBlock>
    )
    const lines = document.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    )
    expect(lines).toHaveLength(3)
    // An empty line holds a newline, so a copied selection keeps it.
    expect(lines[1].textContent).toBe("\n")
    const number = getComputedStyle(lines[0], "::before")
    expect(number.content).toContain("counter(line)")
    expect(number.userSelect).toBe("none")
    expect(
      document.querySelector<HTMLElement>('[data-slot="code-block-content"]')!
        .style.counterReset
    ).toBe("line 11")
  })

  it("a diff line carries its + or − marker, not only its fill", () => {
    render(
      <CodeBlock>
        <CodeBlockContent>
          <CodeBlockLine variant="removed">const limit = 10</CodeBlockLine>
          <CodeBlockLine variant="added">const limit = 20</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
    )
    const [removed, added] = document.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    )
    expect(getComputedStyle(removed, "::after").content).toBe('"−"')
    expect(getComputedStyle(added, "::after").content).toBe('"+"')
  })

  it("a destructive block and a floating copy button show a focus indicator on a card, in the four themes", async () => {
    // On a card the ring-ring/50 halo alone measures 2.98:1 in light: the
    // border-ring is what reaches 3:1.
    render(
      <div className="bg-card">
        <CodeBlock variant="destructive">
          <CodeBlockContent>Error: cannot find module</CodeBlockContent>
        </CodeBlock>
        <Floating />
      </div>
    )
    expect(await unmarkedTabStops()).toEqual([])
  })

  it("a destructive block turns its border border-ring while its code has focus-visible, light and dark", async () => {
    render(
      <CodeBlock variant="destructive">
        <CodeBlockContent>Error: cannot find module</CodeBlockContent>
      </CodeBlock>
    )
    const block = document.querySelector<HTMLElement>(
      '[data-slot="code-block"]'
    )!
    const root = document.documentElement
    const anchor = document.createElement("span")
    anchor.tabIndex = -1
    document.body.prepend(anchor)
    try {
      for (const theme of ["light", "dark"] as const) {
        root.classList.toggle("dark", theme === "dark")
        anchor.focus()
        const rest = borderPaint(block)
        await userEvent.tab()
        expect(document.activeElement?.getAttribute("data-slot")).toBe(
          "code-block-content"
        )
        const focused = borderPaint(block)
        expect(focused.key, theme).not.toBe(rest.key)
        expect(focused.contrast, theme).toBeGreaterThanOrEqual(3)
      }
    } finally {
      root.classList.remove("dark")
      anchor.remove()
    }
  })

  it("with no Clipboard API (plain HTTP), a click throws nothing: the button keeps its name and nothing is announced", async () => {
    vi.spyOn(navigator, "clipboard", "get").mockReturnValue(
      undefined as unknown as Clipboard
    )
    const errors: unknown[] = []
    const onError = (event: ErrorEvent) => {
      errors.push(event.error)
      event.preventDefault()
    }
    window.addEventListener("error", onError)
    try {
      render(<WithHeader />)
      await userEvent.click(
        screen.getByRole("button", { name: UI_STRINGS.codeBlock.copy })
      )
      await new Promise(requestAnimationFrame)
    } finally {
      window.removeEventListener("error", onError)
    }
    expect(errors).toEqual([])
    expect(
      screen.getByRole("button", { name: UI_STRINGS.codeBlock.copy })
    ).toBeTruthy()
    expect(liveRegion().textContent).toBe("")
  })

  it("a floating copy button trades the ring that sets it off the code for the focus ring every Button draws", async () => {
    render(
      <>
        <Floating />
        <Button variant="ghost">Save</Button>
      </>
    )
    const copy = screen.getByRole("button", { name: UI_STRINGS.codeBlock.copy })
    const save = screen.getByRole("button", { name: "Save" })
    expect(ringOf(copy)).toBe(1)

    // Focus may have left the test frame in an earlier test: an anchor out of
    // the tab order, focused first, starts the sequence before the block.
    const anchor = document.createElement("span")
    anchor.tabIndex = -1
    document.body.prepend(anchor)
    anchor.focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(copy)
    const focused = ringOf(copy)
    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement).toBe(save)
    expect(focused).toBe(ringOf(save))
    expect(focused).toBeGreaterThan(1)
    anchor.remove()
  })
})
