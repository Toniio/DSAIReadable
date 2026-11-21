import { useSyncExternalStore } from "react"

import { BRAND_STORAGE_KEY, NOVA_CLASS, type Brand } from "@/site/lib/brand"

const listeners = new Set<() => void>()

/**
 * Puts <html> in a brand and tells the subscribers. Transitions are off while
 * the class changes, as next-themes does for the theme: every color, radius
 * and size of the page moves at once, not one transition after the other.
 */
function applyBrand(brand: Brand) {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  document.documentElement.classList.toggle(NOVA_CLASS, brand === "nova")
  // A reflow computes the new styles while transitions are off: removing
  // the style afterwards starts none.
  void document.body.offsetHeight
  style.remove()
  listeners.forEach((listener) => listener())
}

/** Another tab of the site switched the brand: this one follows. */
function onStorage(event: StorageEvent) {
  // A null key is the whole storage cleared: the brand is lyra again.
  if (event.key !== BRAND_STORAGE_KEY && event.key !== null) return
  applyBrand(
    event.key === BRAND_STORAGE_KEY && event.newValue === "nova"
      ? "nova"
      : "lyra"
  )
}

/** The brand storage holds: lyra unless it says nova, as the root layout reads it. */
function storedBrand(): Brand {
  try {
    return localStorage.getItem(BRAND_STORAGE_KEY) === "nova" ? "nova" : "lyra"
  } catch {
    return documentBrand()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage)
    // Another tab may have switched the brand while this one loaded, before
    // anything listened: the stored brand wins.
    const stored = storedBrand()
    if (stored !== documentBrand()) applyBrand(stored)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener("storage", onStorage)
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
  applyBrand(brand)
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, brand)
  } catch {
    // No storage: the brand holds for this page only.
  }
}
