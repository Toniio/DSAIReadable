import type { ReactNode } from "react"

import { BRANDS, type Brand } from "@/site/lib/brand"

/**
 * A value the tokens resolve at build time, drawn once per brand. The static
 * HTML holds every variant and site.css shows the one `.nova` on <html> asks
 * for, so a nova visitor sees nova's from the first paint, before hydration.
 * Inside, nothing may carry an id: both variants are in the document. Where
 * the brands agree, `differs={false}` draws the value once.
 */
export function InBrand({
  children,
  differs = true,
}: {
  children: (brand: Brand) => ReactNode
  differs?: boolean
}) {
  if (!differs) return children("lyra")
  return BRANDS.map((brand) => (
    <span key={brand} data-brand={brand}>
      {children(brand)}
    </span>
  ))
}
