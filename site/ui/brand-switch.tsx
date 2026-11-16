"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BRANDS } from "@/site/lib/brand"
import { useMounted } from "@/site/ui/use-mounted"
import { setSiteBrand, useSiteBrand } from "@/site/ui/use-site-brand"

/** Lyra or Nova for the whole site and its previews. */
export function BrandSwitch() {
  const brand = useSiteBrand()
  const mounted = useMounted()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Brand"
      // Controlled from the first render: no value until the stored brand is known.
      value={mounted ? brand : ""}
      onValueChange={(value) => {
        const next = BRANDS.find((entry) => entry === value)
        if (next) setSiteBrand(next)
      }}
    >
      {BRANDS.map((value) => (
        <ToggleGroupItem key={value} value={value} className="capitalize">
          {value}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
