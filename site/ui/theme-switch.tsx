"use client"

import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react"
import { useTheme } from "next-themes"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMounted } from "@/site/ui/use-mounted"

const THEMES = [
  { value: "system", label: "Auto", icon: DesktopIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
]

/** Auto, Light or Dark for the whole site. */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      // Joined, one segmented control: the header fits a phone's width.
      spacing={0}
      aria-label="Color theme"
      // Controlled from the first render: no value until the stored theme is known.
      value={mounted ? (theme ?? "system") : ""}
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
    >
      {THEMES.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label}>
          <Icon />
          {/* From lg to xl the header's tabs take the room the labels had. */}
          <span className="hidden md:inline lg:hidden xl:inline">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
