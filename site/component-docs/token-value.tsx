import { cn } from "@/lib/utils"
import type { Brand } from "@/site/lib/brand"
import {
  darkIn,
  differsInNova,
  lightIn,
  tokenByName,
  type Token,
} from "@/site/lib/tokens"
import { InBrand } from "@/site/ui/in-brand"

function Row({
  mode,
  value,
  color,
}: {
  mode: "Light" | "Dark" | "Both"
  value: string
  color: boolean
}) {
  return (
    <span className="flex items-center gap-2">
      {color ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 border"
          // The resolved value, read from tokens.manifest.json at build time.
          style={{ background: value }}
        />
      ) : null}
      <span className="w-9 shrink-0 text-xs text-muted-foreground">{mode}</span>
      <code className={cn("font-mono text-xs", color && "whitespace-nowrap")}>
        {value}
      </code>
    </span>
  )
}

function Rows({ token, brand }: { token: Token; brand: Brand }) {
  const color = token.type === "color"
  const light = lightIn(token.value, brand)
  const dark = darkIn(token.value, brand)
  if (!color && dark === light)
    return <Row mode="Both" value={light} color={false} />
  return (
    <span className="flex flex-col gap-1">
      <Row mode="Light" value={light} color={color} />
      <Row mode="Dark" value={dark} color={color} />
    </span>
  )
}

/**
 * A token's resolved value in light and in dark mode, in the site's brand,
 * with a swatch of each for a color. Any other token shows one value when
 * dark does not change it.
 */
export function TokenValue({ name }: { name: string }) {
  const token = tokenByName(name)
  if (!token) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <InBrand differs={differsInNova(token.value)}>
      {(brand) => <Rows token={token} brand={brand} />}
    </InBrand>
  )
}
