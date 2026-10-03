"use client"

import { useEffect, useState } from "react"

/**
 * A lazily loaded module, once it is there: each page and each preview loads
 * only the examples and stories it shows. `undefined` while loading, and
 * whenever `load` is absent.
 */
export function useModule<T>(
  load: (() => Promise<T>) | undefined
): T | undefined {
  const [loaded, setLoaded] = useState<{ load: () => Promise<T>; value: T }>()

  useEffect(() => {
    if (!load) return
    let live = true
    void load().then((value) => {
      if (live) setLoaded({ load, value })
    })
    return () => {
      live = false
    }
  }, [load])

  return loaded && loaded.load === load ? loaded.value : undefined
}
