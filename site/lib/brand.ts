/** The brands of the design system, lyra first: it is the default. */
export const BRANDS = ["lyra", "nova"] as const

export type Brand = (typeof BRANDS)[number]

/** The class on <html> that turns the nova tokens on: lyra is its absence. */
export const NOVA_CLASS = "nova"

/** Where the site keeps the visitor's brand. */
export const BRAND_STORAGE_KEY = "brand"

/**
 * Runs before the first paint: the export is static, so only the browser
 * knows the stored brand, and a nova visitor must never see lyra first.
 */
export const BRAND_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(BRAND_STORAGE_KEY)})===${JSON.stringify("nova" satisfies Brand)})document.documentElement.classList.add(${JSON.stringify(NOVA_CLASS)})}catch(e){}`
