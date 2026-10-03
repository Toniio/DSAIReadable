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
      aria-label="Color theme"
      value={mounted ? theme : undefined}
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
    >
      {THEMES.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label}>
          <Icon />
          <span className="hidden md:inline">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
