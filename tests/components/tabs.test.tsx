import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { axeViolations } from "../axe"

function Example({ variant }: { variant?: "default" | "line" }) {
  return (
    <Tabs defaultValue="account">
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

describe("Tabs", () => {
  it("exposes a named tablist, its tabs and the active panel", () => {
    render(<Example />)
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeTruthy()
    expect(screen.getAllByRole("tab")).toHaveLength(3)
    expect(selected()).toEqual(["Account"])

    const panel = screen.getByRole("tabpanel", { name: "Account" })
    expect(panel.textContent).toBe("Account settings")
    const tab = screen.getByRole("tab", { name: "Account" })
    expect(tab.getAttribute("aria-controls")).toBe(panel.id)
  })

  it("moves and activates with the arrow keys, Home and End", async () => {
    const user = userEvent.setup()
    render(<Example />)

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Account" })
    )
    await user.keyboard("{ArrowRight}")
    expect(selected()).toEqual(["Password"])
    expect(screen.getByRole("tabpanel", { name: "Password" }).textContent).toBe(
      "Password settings"
    )
    await user.keyboard("{End}")
    expect(selected()).toEqual(["Billing"])
    await user.keyboard("{Home}")
    expect(selected()).toEqual(["Account"])
    await user.keyboard("{ArrowLeft}")
    expect(selected()).toEqual(["Billing"])
  })

  it("moves from the active tab to its panel with Tab", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"))
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
