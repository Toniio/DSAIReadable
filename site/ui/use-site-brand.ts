import { useSyncExternalStore } from "react"

import { BRAND_STORAGE_KEY, NOVA_CLASS, type Brand } from "@/site/lib/brand"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The brand <html> wears: the blocking script of the root layout set it. */
export function documentBrand(): Brand {
  return document.documentElement.classList.contains(NOVA_CLASS)
    ? "nova"
    : "lyra"
}

/**
 * The site's brand: lyra during the static render and hydration, then the
 * stored one. For what exists only after hydration, such as a preview frame:
 * a value the static HTML holds goes through InBrand, or nova sees lyra first.
 */
export function useSiteBrand(): Brand {
  return useSyncExternalStore(subscribe, documentBrand, () => "lyra")
}

/** Puts <html> in a brand, for this page and the next ones. */
export function setSiteBrand(brand: Brand) {
  document.documentElement.classList.toggle(NOVA_CLASS, brand === "nova")
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, brand)
  } catch {
    // No storage: the brand holds for this page only.
  }
  listeners.forEach((listener) => listener())
}
