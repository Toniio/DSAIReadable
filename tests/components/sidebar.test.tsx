import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { page, userEvent } from "vitest/browser"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UI_STRINGS } from "@/lib/ui-strings"

function Example({ onSettings }: { onSettings?: () => void }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <nav aria-label="Main">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onSettings}>
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </nav>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <main className="flex-1 p-4">
        <SidebarTrigger />
        <p>Main content</p>
      </main>
    </SidebarProvider>
  )
}

function sidebarState() {
  return document
    .querySelector("[data-slot=sidebar]")
    ?.getAttribute("data-state")
}

// Below `md` the sidebar becomes a Sheet; the viewport goes back to the
// desktop size of vitest.config.ts whatever the outcome.
async function onMobile(check: () => Promise<void>) {
  await page.viewport(375, 812)
  try {
    await check()
  } finally {
    await page.viewport(1280, 800)
  }
}

describe("Sidebar", () => {
  it("role: menus are lists of buttons; on mobile, the bar opens in a modal dialog", async () => {
    render(<Example />)
    const nav = screen.getByRole("navigation", { name: "Main" })
    const list = within(nav).getByRole("list")
    const items = within(list).getAllByRole("listitem")
    expect(items).toHaveLength(2)
    for (const item of items)
      expect(within(item).getByRole("button")).toBeTruthy()

    await onMobile(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: UI_STRINGS.sidebar.toggle })
      )
      const dialog = await screen.findByRole("dialog")
      expect(dialog.dataset.mobile).toBe("true")
      expect(
        within(dialog).getByRole("button", { name: "Dashboard" })
      ).toBeTruthy()
    })
  })

  it("accessible name: the trigger and the rail take toggleLabel; the mobile Sheet takes mobileTitle", async () => {
    render(<Example />)
    const toggles = screen.getAllByRole("button", {
      name: UI_STRINGS.sidebar.toggle,
    })
    expect(toggles.map((toggle) => toggle.dataset.slot)).toEqual([
      "sidebar-rail",
      "sidebar-trigger",
    ])
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy()

    await onMobile(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: UI_STRINGS.sidebar.toggle })
      )
      expect(
        await screen.findByRole("dialog", {
          name: UI_STRINGS.sidebar.mobileTitle,
          description: UI_STRINGS.sidebar.mobileDescription,
        })
      ).toBeTruthy()
    })
  })

  it("Ctrl+B / Cmd+B: opens / collapses the sidebar", async () => {
    render(<Example />)
    expect(sidebarState()).toBe("expanded")
    await userEvent.keyboard("{Control>}b{/Control}")
    expect(sidebarState()).toBe("collapsed")
    await userEvent.keyboard("{Control>}b{/Control}")
    expect(sidebarState()).toBe("expanded")
    await userEvent.keyboard("{Meta>}b{/Meta}")
    expect(sidebarState()).toBe("collapsed")
    await userEvent.keyboard("{Meta>}b{/Meta}")
    expect(sidebarState()).toBe("expanded")
  })

  it("Tab: moves through the menu items", async () => {
    render(<Example />)
    const dashboard = screen.getByRole("button", { name: "Dashboard" })
    dashboard.focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Settings" })
    )
  })

  it("Enter / Space: activates the item", async () => {
    const onSettings = vi.fn()
    render(<Example onSettings={onSettings} />)
    screen.getByRole("button", { name: "Settings" }).focus()
    await userEvent.keyboard("{Enter}")
    expect(onSettings).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(" ")
    expect(onSettings).toHaveBeenCalledTimes(2)
  })
})
