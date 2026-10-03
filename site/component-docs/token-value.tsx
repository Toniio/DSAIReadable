import { cn } from "@/lib/utils"
import { darkValue, tokenByName } from "@/site/lib/tokens"

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

/**
 * A token's resolved value in light and in dark mode, with a swatch of each
 * for a color. Any other token shows one value when dark does not change it.
 */
export function TokenValue({ name }: { name: string }) {
  const token = tokenByName(name)
  if (!token) return <span className="text-xs text-muted-foreground">—</span>
  const color = token.type === "color"
  if (!color && token.value.dark === undefined)
    return <Row mode="Both" value={token.value.light} color={false} />
  return (
    <span className="flex flex-col gap-1">
      <Row mode="Light" value={token.value.light} color={color} />
      <Row mode="Dark" value={darkValue(token)} color={color} />
    </span>
  )
}
