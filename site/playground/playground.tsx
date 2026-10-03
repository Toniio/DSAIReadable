"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareOutIcon,
  CircleHalfIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  type Icon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AUTO, isIconOnly, isLink } from "@/site/playground/auto"
import {
  Canvas,
  previewPath,
  useSiteTheme,
  type Viewport,
} from "@/site/playground/canvas"
import { defaultArgs, resolveArgs } from "@/site/playground/args"
import { ControlPanel } from "@/site/playground/control-panel"
import { changedArgs, element, snippet, text } from "@/site/playground/jsx"
import type { FrameState } from "@/site/playground/protocol"
import { SCENARIOS } from "@/site/playground/scenarios"
import {
  type Args,
  type Control,
  FORCED_STATE_LABELS,
  type ForcedState,
} from "@/site/playground/types"
import { useModule } from "@/site/playground/use-module"
import { CodeBlock } from "@/site/ui/code-block"

type ThemeChoice = "site" | "light" | "dark"

interface IconChoice<T extends string> {
  value: T
  label: string
  icon: Icon
}

/** The site's theme is a half disc: unlike a screen, it reads apart from the widths. */
const THEMES: IconChoice<ThemeChoice>[] = [
  { value: "site", label: "Site theme", icon: CircleHalfIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
]

const VIEWPORTS: IconChoice<Viewport>[] = [
  { value: "desktop", label: "Desktop", icon: DesktopIcon },
  { value: "tablet", label: "Tablet", icon: DeviceTabletIcon },
  { value: "mobile", label: "Mobile", icon: DeviceMobileIcon },
]

/** A group of icon-only toggles, each named by its tooltip as well as its label. */
function IconToggles<T extends string>({
  label,
  choices,
  value,
  onChange,
}: {
  label: string
  choices: IconChoice<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      aria-label={label}
      value={value}
      onValueChange={(next) => {
        const choice = choices.find((entry) => entry.value === next)
        if (choice) onChange(choice.value)
      }}
    >
      {choices.map(({ value: option, label: name, icon: Glyph }) => (
        <Tooltip key={option}>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={option} aria-label={name}>
              <Glyph />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}

/** The controls and code of a component's playground, generic or hand-written. */
export function useStoryControls(
  name: string,
  file: string,
  autoControls: Control[]
) {
  const auto = AUTO[name]
  const scenario = useModule(auto ? undefined : SCENARIOS[name])?.default
  const controls = auto ? autoControls : (scenario?.controls ?? [])
  const code = (args: Args): string | undefined => {
    if (auto) {
      const props = { ...auto.fixed, ...changedArgs(controls, args) }
      // An icon-only size draws the icon, named by aria-label (the spec's MUST).
      if (auto.iconOnly && isIconOnly(auto, args))
        return snippet(
          file,
          auto.export,
          element(
            auto.export,
            { ...props, "aria-label": auto.iconOnly.label },
            "<PlusIcon />"
          ),
          [`import { PlusIcon } from "@phosphor-icons/react"`]
        )
      const children =
        auto.children === undefined
          ? undefined
          : text(String(args.children ?? ""))
      // As a link (Badge with asChild), the text sits in the <a> it renders.
      if (auto.link && isLink(auto, args))
        return snippet(
          file,
          auto.export,
          element(auto.export, props, `<a href="${auto.link}">${children}</a>`)
        )
      return snippet(file, auto.export, element(auto.export, props, children))
    }
    return scenario?.code?.(args)
  }
  return {
    controls,
    code,
    loaded: Boolean(auto) || scenario !== undefined,
    // Known before the scenario's module loads: the page starts on the
    // playground, and never shows the example first for a moment.
    hasStory: auto
      ? controls.length > 0
      : scenario
        ? controls.length > 0
        : SCENARIOS[name] !== undefined,
    tall: scenario?.layout === "fullscreen",
    gridable:
      Boolean(auto) ||
      (scenario !== undefined &&
        scenario.grid !== false &&
        scenario.layout !== "fullscreen"),
  }
}

/**
 * The playground of a component page: the component live, its props as
 * controls, its interaction states forced, in light or dark, at the width of
 * a desktop, a tablet or a phone, with the code of what is shown.
 */
export function Playground({
  name,
  slug,
  autoControls,
  states,
  exampleCode,
}: {
  name: string
  slug: string
  autoControls: Control[]
  /** The states the component draws: the canvas offers to force those. */
  states: ForcedState[]
  /** The spec's code example, shown in the Example view. */
  exampleCode: string
}) {
  const { controls, code, hasStory, tall } = useStoryControls(
    name,
    slug,
    autoControls
  )
  const siteTheme = useSiteTheme()
  const [view, setView] = useState<"story" | "example">()
  const [edited, setEdited] = useState<Args>({})
  const [forced, setForced] = useState<ForcedState>("rest")
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("site")
  const [viewport, setViewport] = useState<Viewport>("desktop")
  // Bumped by Reset: the canvas mounts the story again, so what the reader
  // changed inside it (a dialog closed, a box checked) is undone too.
  const [nonce, setNonce] = useState(0)

  const current = view ?? (hasStory ? "story" : "example")
  const args = useMemo(
    () => ({ ...defaultArgs(controls), ...edited }),
    [controls, edited]
  )
  const theme = themeChoice === "site" ? siteTheme : themeChoice
  const frameState = useMemo<FrameState>(
    () => ({
      view: current,
      args: resolveArgs(controls, args),
      state: current === "story" ? forced : "rest",
      theme,
      nonce,
    }),
    [current, controls, args, forced, theme, nonce]
  )
  const shownCode =
    current === "story" ? (code(args) ?? exampleCode) : exampleCode

  return (
    <div className="flex flex-col border">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-2">
        {hasStory ? (
          <ToggleGroup
            type="single"
            size="sm"
            aria-label="View"
            value={current}
            onValueChange={(value) => {
              if (value) setView(value as "story" | "example")
            }}
          >
            <ToggleGroupItem value="story">Playground</ToggleGroupItem>
            <ToggleGroupItem value="example">Example</ToggleGroupItem>
          </ToggleGroup>
        ) : (
          <span className="text-sm font-medium">Example</span>
        )}
        {current === "story" && states.length > 1 ? (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label="Interaction state"
            value={forced}
            onValueChange={(value) => {
              if (value) setForced(value as ForcedState)
            }}
          >
            {states.map((state) => (
              <ToggleGroupItem key={state} value={state}>
                {FORCED_STATE_LABELS[state]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <IconToggles
            label="Preview theme"
            choices={THEMES}
            value={themeChoice}
            onChange={setThemeChoice}
          />
          <Separator orientation="vertical" />
          <IconToggles
            label="Viewport width"
            choices={VIEWPORTS}
            value={viewport}
            onChange={setViewport}
          />
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              href={previewPath("component", slug, frameState)}
              target="_blank"
              aria-label="Open the canvas in a new tab"
            >
              <ArrowSquareOutIcon />
            </Link>
          </Button>
        </div>
      </div>
      <Canvas
        slug={slug}
        state={frameState}
        title={`${name} preview`}
        viewport={viewport}
        tall={tall}
        className="bg-muted"
      />
      {current === "story" ? (
        <div className="flex flex-col gap-4 border-t p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">Controls</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEdited({})
                setForced("rest")
                setNonce((previous) => previous + 1)
              }}
            >
              <ArrowCounterClockwiseIcon />
              Reset
            </Button>
          </div>
          <ControlPanel
            idPrefix={`${slug}-control`}
            controls={controls}
            args={args}
            onChange={(prop, value) =>
              setEdited((previous) => ({ ...previous, [prop]: value }))
            }
          />
        </div>
      ) : null}
      <Separator />
      <CodeBlock
        code={shownCode}
        language="tsx"
        title="Code"
        className="border-0"
      />
    </div>
  )
}
