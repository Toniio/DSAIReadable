import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { axeViolations } from "../axe"

function Example({
  variant,
  orientation,
  defaultValue = "account",
}: {
  variant?: "default" | "line"
  orientation?: "horizontal" | "vertical"
  defaultValue?: string
}) {
  return (
    <Tabs defaultValue={defaultValue} orientation={orientation}>
      <TabsList variant={variant} aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
      <TabsContent value="billing">Billing settings</TabsContent>
    </Tabs>
  )
}

function selected() {
  return screen
    .getAllByRole("tab")
    .filter((tab) => tab.getAttribute("aria-selected") === "true")
    .map((tab) => tab.textContent)
}

function focused() {
  return document.activeElement?.textContent
}

describe("Tabs", () => {
  it("role: a tablist of tabs (aria-selected, aria-controls) and the active tabpanel", () => {
    render(<Example />)
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeTruthy()
    expect(screen.getAllByRole("tab")).toHaveLength(3)
    expect(selected()).toEqual(["Account"])
    expect(
      screen
        .getByRole("tab", { name: "Password" })
        .getAttribute("aria-selected")
    ).toBe("false")

    const panel = screen.getByRole("tabpanel", { name: "Account" })
    expect(panel.textContent).toBe("Account settings")
    const tab = screen.getByRole("tab", { name: "Account" })
    expect(tab.getAttribute("aria-controls")).toBe(panel.id)
  })

  it("accessible name: each tab is named by its text, the list by its aria-label", () => {
    render(<Example />)
    expect(
      screen.getAllByRole("tab").map((tab) => tab.getAttribute("aria-label"))
    ).toEqual([null, null, null])
    for (const name of ["Account", "Password", "Billing"]) {
      expect(screen.getByRole("tab", { name })).toBeTruthy()
    }
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeTruthy()
    // The panel takes the name of the tab that controls it.
    expect(screen.getByRole("tabpanel", { name: "Account" })).toBeTruthy()
  })

  it("Tab: enters the list on the active tab, then moves to the panel", async () => {
    const user = userEvent.setup()
    render(<Example defaultValue="password" />)
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Password" })
    )
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"))
    expect(document.activeElement?.textContent).toBe("Password settings")
  })

  it("ArrowRight / ArrowLeft: next / previous tab, activated (horizontal orientation)", async () => {
    const user = userEvent.setup()
    render(<Example />)

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Account" })
    )
    await user.keyboard("{ArrowRight}")
    expect(focused()).toBe("Password")
    expect(selected()).toEqual(["Password"])
    expect(screen.getByRole("tabpanel", { name: "Password" }).textContent).toBe(
      "Password settings"
    )
    await user.keyboard("{ArrowLeft}")
    expect(focused()).toBe("Account")
    expect(selected()).toEqual(["Account"])
    await user.keyboard("{ArrowLeft}")
    expect(focused()).toBe("Billing")
    expect(selected()).toEqual(["Billing"])
  })

  it("ArrowDown / ArrowUp: same, in the vertical orientation", async () => {
    const user = userEvent.setup()
    render(<Example orientation="vertical" />)
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe(
      "vertical"
    )

    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(focused()).toBe("Password")
    expect(selected()).toEqual(["Password"])
    expect(screen.getByRole("tabpanel", { name: "Password" }).textContent).toBe(
      "Password settings"
    )
    await user.keyboard("{ArrowUp}")
    expect(focused()).toBe("Account")
    expect(selected()).toEqual(["Account"])
  })

  it("Home / End: first / last tab", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.keyboard("{End}")
    expect(focused()).toBe("Billing")
    expect(selected()).toEqual(["Billing"])
    await user.keyboard("{Home}")
    expect(focused()).toBe("Account")
    expect(selected()).toEqual(["Account"])
  })

  it("applies the list variant", () => {
    const { unmount } = render(<Example />)
    let list = screen.getByRole("tablist")
    expect(list.dataset.variant).toBe("default")
    expect(list.classList).toContain("bg-muted")
    unmount()

    render(<Example variant="line" />)
    list = screen.getByRole("tablist")
    expect(list.dataset.variant).toBe("line")
    expect(list.classList).toContain("bg-transparent")
    expect(list.classList).not.toContain("bg-muted")
  })

  it("has no axe violations", async () => {
    render(<Example />)
    expect(await axeViolations()).toEqual([])
  })
})
