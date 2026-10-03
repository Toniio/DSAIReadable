import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

/**
 * False during the static render and hydration, true after: for a value only
 * the browser knows (the stored theme), so the first render matches the HTML.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
