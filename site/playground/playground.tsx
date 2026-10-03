"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareOutIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AUTO } from "@/site/playground/auto"
import {
  Canvas,
  previewUrl,
  useSiteTheme,
  type Viewport,
} from "@/site/playground/canvas"
import {
  ControlPanel,
  defaultArgs,
  resolveArgs,
} from "@/site/playground/control-panel"
import { changedArgs, element, snippet } from "@/site/playground/jsx"
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
      const children =
        auto.children === undefined ? undefined : String(args.children ?? "")
      const props = { ...auto.fixed, ...changedArgs(controls, args) }
      return snippet(file, auto.export, element(auto.export, props, children))
    }
    return scenario?.code?.(args)
  }
  return {
    controls,
    code,
    loaded: Boolean(auto) || scenario !== undefined,
    tall: scenario?.layout === "fullscreen",
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
  const { controls, code, loaded, tall } = useStoryControls(
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

  const hasStory = loaded && controls.length > 0
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
    }),
    [current, controls, args, forced, theme]
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
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label="Preview theme"
            value={themeChoice}
            onValueChange={(value) => {
              if (value) setThemeChoice(value as ThemeChoice)
            }}
          >
            <ToggleGroupItem value="site" aria-label="Site theme">
              <MonitorIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="light" aria-label="Light">
              <SunIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark">
              <MoonIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label="Viewport width"
            value={viewport}
            onValueChange={(value) => {
              if (value) setViewport(value as Viewport)
            }}
          >
            <ToggleGroupItem value="desktop" aria-label="Desktop">
              <DesktopIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet">
              <DeviceTabletIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Mobile">
              <DeviceMobileIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              href={previewUrl("component", slug, frameState)}
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
