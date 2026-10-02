/**
 * `next/navigation` for stage B. A screen is written for a Next.js app, and
 * `useRouter()` throws "invariant expected app router to be mounted" outside
 * one: a screen that navigates after a save would fail to render for that
 * alone. These stand-ins render it as the page it is, on `/`, with no query;
 * navigating does nothing. Stage A type-checks against the real module.
 */

const router = {
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => {},
}

export const useRouter = () => router
export const usePathname = () => "/"
export const useSearchParams = () => new URLSearchParams()
export const useParams = () => ({})
export const useSelectedLayoutSegment = () => null
export const useSelectedLayoutSegments = () => []

/** Rendering a screen that redirects at once renders no screen. */
export function redirect(url: string): never {
  throw new Error(`the screen redirects to ${url} as it renders`)
}
export const permanentRedirect = redirect
export function notFound(): never {
  throw new Error("the screen calls notFound() as it renders")
}
