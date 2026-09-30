import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

function Example({ label }: { label?: string }) {
  return (
    // An explicit aria-label={undefined} would override the Radix default.
    <NavigationMenu {...(label ? { "aria-label": label } : {})}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/products/catalog">
              Catalog
            </NavigationMenuLink>
            <NavigationMenuLink href="/products/new">
              New arrivals
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/resources/guides">
              Guides
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function trigger(name: string) {
  return screen.getByRole("button", { name })
}

async function openProducts() {
  render(<Example />)
  const products = trigger("Products")
  products.focus()
  await userEvent.keyboard("{Enter}")
  await expect.poll(() => products.getAttribute("aria-expanded")).toBe("true")
  return products
}

describe("NavigationMenu", () => {
  it("role: a nav whose triggers are buttons with aria-expanded and whose links are native", async () => {
    render(<Example />)
    const nav = screen.getByRole("navigation")
    const products = trigger("Products")
    expect(nav.contains(products)).toBe(true)
    expect(products.tagName).toBe("BUTTON")
    expect(products.getAttribute("aria-expanded")).toBe("false")

    const about = screen.getByRole("link", { name: "About" })
    expect(about.tagName).toBe("A")
    expect(about.getAttribute("href")).toBe("/about")

    await userEvent.click(products)
    await expect.poll(() => products.getAttribute("aria-expanded")).toBe("true")
    const catalog = screen.getByRole("link", { name: "Catalog" })
    expect(catalog.tagName).toBe("A")
  })

  it("accessible name: Radix names the landmark Main; an aria-label replaces it", () => {
    const { unmount } = render(<Example />)
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy()
    unmount()
    render(<Example label="Site" />)
    expect(screen.getByRole("navigation", { name: "Site" })).toBeTruthy()
  })

  it("Tab / Shift+Tab: moves to the next / previous trigger or link", async () => {
    render(<Example />)
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger("Products"))
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger("Resources"))
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "About" })
    )
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(trigger("Resources"))
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(trigger("Products"))
  })

  it("Enter / Space: opens the trigger's content", async () => {
    render(<Example />)
    const products = trigger("Products")
    for (const key of ["{Enter}", "{ }"]) {
      products.focus()
      await userEvent.keyboard(key)
      await expect
        .poll(() => products.getAttribute("aria-expanded"))
        .toBe("true")
      expect(screen.getByRole("link", { name: "Catalog" })).toBeTruthy()
      await userEvent.keyboard("{Escape}")
      await expect
        .poll(() => products.getAttribute("aria-expanded"))
        .toBe("false")
    }
  })

  it("ArrowDown: moves into the open content", async () => {
    await openProducts()
    await userEvent.keyboard("{ArrowDown}")
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole("link", { name: "Catalog" }))
  })

  it("ArrowLeft / ArrowRight: moves to the previous / next trigger", async () => {
    render(<Example />)
    trigger("Products").focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(trigger("Resources"))
    await userEvent.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(trigger("Products"))
  })

  it("Escape: closes the content and returns focus to the trigger", async () => {
    const products = await openProducts()
    await userEvent.keyboard("{ArrowDown}")
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole("link", { name: "Catalog" }))
    await userEvent.keyboard("{Escape}")
    await expect
      .poll(() => products.getAttribute("aria-expanded"))
      .toBe("false")
    expect(screen.queryByRole("link", { name: "Catalog" })).toBeNull()
    expect(document.activeElement).toBe(products)
  })
})
