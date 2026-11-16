import { describe, expect, it } from "vitest"

import { cn } from "@/lib/cn"

/**
 * tailwind-merge only knows the classes it is told about: without the roles in
 * `extendTailwindMerge`, it reads `text-ui` as a color and deletes it next to
 * `text-muted-foreground`, and the component loses its size.
 */
describe("cn", () => {
  it.each([
    ["text-ui text-muted-foreground", "text-ui text-muted-foreground"],
    ["text-control font-medium", "text-control font-medium"],
    ["text-title md:text-ui", "text-title md:text-ui"],
  ])("keeps a text role beside another utility: %s", (input, expected) => {
    expect(cn(input)).toBe(expected)
  })

  it.each([
    ["text-description text-sm", "text-sm"],
    ["text-xs text-ui", "text-ui"],
    ["rounded-control rounded-md", "rounded-md"],
    ["rounded-none rounded-surface", "rounded-surface"],
    ["rounded-t-surface rounded-t-none", "rounded-t-none"],
  ])("lets the last of two sizes or radii win: %s", (input, expected) => {
    expect(cn(input)).toBe(expected)
  })
})
