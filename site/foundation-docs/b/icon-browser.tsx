"use client"

import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import Link from "next/link"
import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import type { IconProps, IconWeight } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { WEIGHTS, type IconSize } from "@/site/foundation-docs/b/icon-settings"
import { LINK } from "@/site/ui/link"

/** Each size as a whole class, so that Tailwind compiles it. */
const SIZE_CLASS: Record<IconSize["step"], string> = {
  "4": "size-4",
  "5": "size-5",
  "6": "size-6",
}

interface Settings {
  size: IconSize["step"]
  weight: IconWeight
  setSize: (size: IconSize["step"]) => void
  setWeight: (weight: IconWeight) => void
}

const SettingsContext = createContext<Settings>({
  size: "4",
  weight: "regular",
  setSize: () => {},
  setWeight: () => {},
})

/** The size and weight every icon grid of the page draws with. */
export function IconSettings({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<IconSize["step"]>("4")
  const [weight, setWeight] = useState<IconWeight>("regular")
  const value = useMemo(
    () => ({ size, weight, setSize, setWeight }),
    [size, weight]
  )
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

/** The size toggle and the weight select, bound to the page's settings. */
function SettingsControls({ sizes }: { sizes: IconSize[] }) {
  const { size, weight, setSize, setWeight } = useContext(SettingsContext)
  const id = useId()
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <span id={`${id}-size`} className="text-xs text-muted-foreground">
          Size
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-labelledby={`${id}-size`}
          value={size}
          onValueChange={(next) => {
            if (next) setSize(next as IconSize["step"])
          }}
        >
          {sizes.map((option) => (
            <ToggleGroupItem key={option.step} value={option.step}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-weight`} className="text-xs font-normal">
          Weight
        </Label>
        <NativeSelect
          id={`${id}-weight`}
          size="sm"
          value={weight}
          onChange={(event) => setWeight(event.target.value as IconWeight)}
        >
          {WEIGHTS.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  )
}

/** A search field with its label, visually hidden: the placeholder says it. */
function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="flex min-w-56 flex-1 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-normal">
        {label}
      </Label>
      <div className="relative">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          type="search"
          className="pl-8"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}

/** The import line a tile copies. */
function importLine(name: string, library: string): string {
  return `import { ${name} } from "${library}"`
}

/** Copies an import line, and remembers which one for a moment. */
function useCopy(library: string) {
  const [copied, setCopied] = useState<string>()
  const copy = (name: string) => {
    void navigator.clipboard.writeText(importLine(name, library)).then(() => {
      setCopied(name)
      window.setTimeout(
        () => setCopied((current) => (current === name ? undefined : current)),
        1500
      )
    })
  }
  return { copied, copy }
}

/** One icon: a button that copies its import, the glyph and the name. */
function Tile({
  name,
  glyph,
  copied,
  onCopy,
  children,
}: {
  name: string
  glyph: ReactNode
  copied: boolean
  onCopy: () => void
  children?: ReactNode
}) {
  return (
    <li className="flex min-w-0 flex-col bg-background">
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full flex-col gap-3 px-2 py-5 whitespace-normal"
        aria-label={`Copy the import of ${name}`}
        onClick={onCopy}
      >
        <span className="flex size-6 items-center justify-center text-foreground">
          {copied ? <CheckIcon className="size-4 text-success" /> : glyph}
        </span>
        <span className="max-w-full font-mono text-xs font-normal break-all">
          {name}
        </span>
      </Button>
      {children}
    </li>
  )
}

/**
 * The icons the components import. Their glyphs come from the server, one
 * per weight; the grid shows the one the settings pick.
 */
export function UsedIcons({
  icons,
  sizes,
  library,
}: {
  icons: {
    name: string
    usedBy: { name: string; slug: string }[]
    glyph: ReactNode
  }[]
  sizes: IconSize[]
  library: string
}) {
  const { size, weight } = useContext(SettingsContext)
  const [query, setQuery] = useState("")
  const { copied, copy } = useCopy(library)
  const shown = icons.filter((icon) =>
    icon.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <SearchField
          label="Filter"
          placeholder={`Filter ${icons.length} icons`}
          value={query}
          onChange={setQuery}
        />
        <SettingsControls sizes={sizes} />
      </div>
      <p role="status" className="sr-only">
        {copied ? `Copied the import of ${copied}` : ""}
      </p>
      {shown.length ? (
        <ul
          data-size={size}
          data-weight={weight}
          className="group/icons grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-4"
        >
          {shown.map((icon) => (
            <Tile
              key={icon.name}
              name={icon.name}
              glyph={icon.glyph}
              copied={copied === icon.name}
              onCopy={() => copy(icon.name)}
            >
              <p className="flex flex-wrap justify-center gap-x-2 px-2 pb-3 text-center text-xs text-muted-foreground">
                {icon.usedBy.map((user) => (
                  <Link
                    key={user.slug}
                    href={`/components/${user.slug}/`}
                    className={cn(
                      LINK,
                      "inline-flex min-h-target items-center"
                    )}
                  >
                    {user.name}
                  </Link>
                ))}
              </p>
            </Tile>
          ))}
        </ul>
      ) : (
        <p className="border p-6 text-sm text-muted-foreground">
          No icon of the components matches “{query}”.
        </p>
      )}
    </div>
  )
}

/** How many icons the catalog shows at a time. */
const PAGE = 120

type Catalog = { name: string; Icon: ComponentType<IconProps> }[]

/**
 * The whole icon library, loaded when asked: the page does not ship it
 * until then. A search, and the icons shown a page at a time.
 */
export function IconCatalog({
  sizes,
  library,
  catalogUrl,
}: {
  sizes: IconSize[]
  library: string
  catalogUrl: string
}) {
  const { size, weight } = useContext(SettingsContext)
  const [catalog, setCatalog] = useState<Catalog>()
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(PAGE)
  const { copied, copy } = useCopy(library)

  const load = () => {
    setLoading(true)
    void import("@phosphor-icons/react").then((module) => {
      const icons = Object.entries(module)
        .filter(
          ([name, value]) =>
            name.endsWith("Icon") &&
            typeof value === "object" &&
            value !== null &&
            "render" in value
        )
        .map(([name, value]) => ({
          name,
          Icon: value as ComponentType<IconProps>,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setCatalog(icons)
      setLoading(false)
    })
  }

  if (!catalog)
    return (
      <div className="flex flex-col items-start gap-3 border p-6">
        <p className="text-sm text-muted-foreground">
          Every icon of the library, searchable. It loads on demand, so this
          page stays light until you ask for it. The same icons are on{" "}
          <Link href={catalogUrl} className={LINK}>
            phosphoricons.com
          </Link>
          .
        </p>
        <Button type="button" onClick={load} disabled={loading}>
          {loading ? <Spinner aria-label="Loading the catalog" /> : null}
          Load the full catalog
        </Button>
      </div>
    )

  const needle = query.trim().toLowerCase()
  const matches = catalog.filter((icon) =>
    icon.name.toLowerCase().includes(needle)
  )
  const shown = matches.slice(0, limit)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <SearchField
          label="Search"
          placeholder={`Search ${catalog.length} icons`}
          value={query}
          onChange={(value) => {
            setQuery(value)
            setLimit(PAGE)
          }}
        />
        <SettingsControls sizes={sizes} />
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {copied
          ? `Copied the import of ${copied}`
          : `Showing ${shown.length} of ${matches.length}`}
      </p>
      {shown.length ? (
        <ul className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {shown.map(({ name, Icon }) => (
            <Tile
              key={name}
              name={name}
              glyph={
                <Icon
                  aria-hidden="true"
                  weight={weight}
                  className={SIZE_CLASS[size]}
                />
              }
              copied={copied === name}
              onCopy={() => copy(name)}
            />
          ))}
        </ul>
      ) : (
        <p className="border p-6 text-sm text-muted-foreground">
          No icon matches “{query}”.
        </p>
      )}
      {matches.length > shown.length ? (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          onClick={() => setLimit((current) => current + PAGE)}
        >
          Show more
        </Button>
      ) : null}
    </div>
  )
}
