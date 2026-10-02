import { render, screen } from "@testing-library/react"
import testingUserEvent from "@testing-library/user-event"
import { CopyIcon } from "@phosphor-icons/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * What tw-animate-css's `enter` or `exit` keyframes read on an element: its
 * animation, the opacity it fades from or to, and the five variables of the
 * movement. Each one is registered with `syntax: "*"`, so Chromium returns
 * its value as written: "0", or "1" for the scale.
 */
function motion(element: Element, phase: "enter" | "exit") {
  const style = getComputedStyle(element)
  const variable = (name: string) =>
    style.getPropertyValue(`--tw-${phase}-${name}`).trim()
  return {
    animationName: style.animationName,
    opacity: variable("opacity"),
    translateX: variable("translate-x"),
    translateY: variable("translate-y"),
    scale: variable("scale"),
    rotate: variable("rotate"),
    blur: variable("blur"),
  }
}

/** A fade from or to transparent, with no slide, zoom, spin or blur. */
function fadeOnly(animationName: "enter" | "exit") {
  return {
    animationName,
    opacity: "0",
    translateX: "0",
    translateY: "0",
    scale: "1",
    rotate: "0",
    blur: "0",
  }
}

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes apply immediately.</DialogDescription>
        </DialogHeader>
        <Label htmlFor="display-name">Display name</Label>
        <Input id="display-name" />
        <DialogFooter showCloseButton>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ControlledDialog({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes apply immediately.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

function SheetExample() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open panel</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Account details</SheetTitle>
          <SheetDescription>
            Review and update your account information.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function PopoverExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Settings</Button>
      </PopoverTrigger>
      <PopoverContent aria-labelledby="dimensions-title">
        <PopoverHeader>
          <PopoverTitle id="dimensions-title">Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions of the component.
          </PopoverDescription>
        </PopoverHeader>
        <Label htmlFor="width">Width</Label>
        <Input id="width" />
        <Label htmlFor="height">Height</Label>
        <Input id="height" />
      </PopoverContent>
    </Popover>
  )
}

function DropdownMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TooltipExample() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Copy">
            <CopyIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Copy <Kbd>⌘C</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function DrawerExample() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow down your search with the filters below.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

describe("Reduced motion: overlays", () => {
  it("runs in a browser that reports prefers-reduced-motion: reduce", () => {
    expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true)
  })

  it("Dialog: enters with a fade only, no zoom", async () => {
    const user = testingUserEvent.setup()
    render(<DialogExample />)
    await user.click(screen.getByRole("button", { name: "Edit profile" }))
    const dialog = screen.getByRole("dialog")
    expect(dialog.dataset.slot).toBe("dialog-content")
    expect(motion(dialog, "enter")).toEqual(fadeOnly("enter"))
  })

  it("Dialog: exits with a fade only, no zoom", () => {
    const { rerender } = render(<ControlledDialog open />)
    const dialog = screen.getByRole("dialog")
    rerender(<ControlledDialog open={false} />)
    // The fade is kept, so Radix keeps the dialog mounted until it ends.
    expect(dialog.isConnected).toBe(true)
    expect(dialog.dataset.state).toBe("closed")
    expect(motion(dialog, "exit")).toEqual(fadeOnly("exit"))
  })

  it("Sheet: enters with a fade only, no slide", async () => {
    render(<SheetExample />)
    await userEvent.click(screen.getByRole("button", { name: "Open panel" }))
    const sheet = screen.getByRole("dialog")
    expect(sheet.dataset.slot).toBe("sheet-content")
    expect(motion(sheet, "enter")).toEqual(fadeOnly("enter"))
  })

  it("Popover: enters with a fade only, no zoom or slide", async () => {
    render(<PopoverExample />)
    await userEvent.click(screen.getByRole("button", { name: "Settings" }))
    const popover = screen.getByRole("dialog")
    expect(popover.dataset.slot).toBe("popover-content")
    expect(motion(popover, "enter")).toEqual(fadeOnly("enter"))
  })

  it("DropdownMenu: enters with a fade only, no zoom or slide", async () => {
    render(<DropdownMenuExample />)
    await userEvent.click(screen.getByRole("button", { name: "Options" }))
    const menu = screen.getByRole("menu")
    expect(menu.dataset.slot).toBe("dropdown-menu-content")
    expect(motion(menu, "enter")).toEqual(fadeOnly("enter"))
  })

  it("Tooltip: enters with a fade only, no zoom or slide", async () => {
    render(<TooltipExample />)
    // Hover, not focus: focus opens the tooltip instantly, with no animation.
    await userEvent.hover(screen.getByRole("button", { name: "Copy" }))
    await screen.findByRole("tooltip")
    const content = document.querySelector<HTMLElement>(
      '[data-slot="tooltip-content"]'
    )!
    expect(content.dataset.state).toBe("delayed-open")
    expect(motion(content, "enter")).toEqual(fadeOnly("enter"))
  })

  it("Drawer: fades in and out instead of sliding", async () => {
    render(<DrawerExample />)
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }))
    const drawer = screen.getByRole("dialog")
    expect(drawer.dataset.slot).toBe("drawer-content")
    expect(getComputedStyle(drawer).animationName).toBe("fadeIn")

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await expect.poll(() => drawer.dataset.state).toBe("closed")
    expect(getComputedStyle(drawer).animationName).toBe("fadeOut")
  })
})
