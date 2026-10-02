import { render, screen } from "@testing-library/react"
import testingUserEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

function Example({ label = "aria-label" }: { label?: "aria-label" | "Label" }) {
  return (
    <>
      {label === "Label" && <Label htmlFor="code">Verification code</Label>}
      <InputOTP
        id="code"
        maxLength={6}
        aria-label={label === "aria-label" ? "Verification code" : undefined}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </>
  )
}

function focusInput() {
  render(<Example />)
  const input = screen.getByRole("textbox", {
    name: "Verification code",
  }) as HTMLInputElement
  input.focus()
  return input
}

function slots() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]')
  )
}

function slotChars() {
  return slots().map((slot) => slot.textContent)
}

function activeSlots() {
  return slots().flatMap((slot, index) =>
    slot.dataset.active === "true" ? [index] : []
  )
}

describe("InputOtp", () => {
  it("role: one real input takes the typing, the slots are visual, the separator is a separator", () => {
    render(<Example />)
    expect(screen.getAllByRole("textbox")).toHaveLength(1)
    for (const slot of slots()) {
      expect(slot.getAttribute("role")).toBeNull()
      expect(slot.tabIndex).toBe(-1)
    }
    expect(screen.getByRole("separator")).toBeTruthy()
  })

  it("accessible name: the input is named by an aria-label or a Label", () => {
    const { unmount } = render(<Example />)
    expect(
      screen.getByRole("textbox", { name: "Verification code" })
    ).toBeTruthy()
    unmount()

    render(<Example label="Label" />)
    expect(
      screen.getByRole("textbox", { name: "Verification code" })
    ).toBeTruthy()
  })

  it("Digits / letters: fill in the code slot by slot", async () => {
    const input = focusInput()
    await userEvent.keyboard("1")
    expect(slotChars()).toEqual(["1", "", "", "", "", ""])
    await expect.poll(activeSlots).toEqual([1])
    await userEvent.keyboard("a2")
    expect(input.value).toBe("1a2")
    expect(slotChars()).toEqual(["1", "a", "2", "", "", ""])
    await expect.poll(activeSlots).toEqual([3])
  })

  it("the fake caret blinks on its own timing, so it carries no duration class", async () => {
    // animate-caret-blink sets its own 1.25s and reads neither
    // transition-duration nor --tw-duration: a duration-* class beside it is
    // dead, and motion.duration.extra-slow documents no component.
    await userEvent.click(focusInput())
    const caret = document.querySelector<HTMLElement>(".animate-caret-blink")
    expect(caret).not.toBeNull()
    expect(
      [...caret!.classList].filter((c) => c.startsWith("duration-"))
    ).toEqual([])
  })

  it("Backspace: deletes the previous character", async () => {
    const input = focusInput()
    await userEvent.keyboard("123")
    await userEvent.keyboard("{Backspace}")
    expect(input.value).toBe("12")
    expect(slotChars()).toEqual(["1", "2", "", "", "", ""])
    await expect.poll(activeSlots).toEqual([2])
  })

  it("ArrowLeft / ArrowRight: moves the cursor", async () => {
    const input = focusInput()
    await userEvent.keyboard("123")
    await expect.poll(activeSlots).toEqual([3])
    // input-otp re-reads the selection 0, 10 and 50 ms after each value change
    // and keeps it as the previous one, from which its selectionchange handler
    // tells which way an arrow moved. A re-read between an ArrowLeft's caret
    // move and its selectionchange reads the move as forward: the cursor stays
    // on its slot. A 50 ms timer set now fires after input-otp's last one.
    await new Promise((resolve) => setTimeout(resolve, 50))
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(activeSlots).toEqual([2])
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(activeSlots).toEqual([1])
    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(activeSlots).toEqual([2])
    expect(input.value).toBe("123")
  })

  it("Paste: fills every slot", async () => {
    const user = testingUserEvent.setup()
    const input = focusInput()
    await user.paste("482915")
    expect(input.value).toBe("482915")
    expect(slotChars()).toEqual(["4", "8", "2", "9", "1", "5"])
  })
})
