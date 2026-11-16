/**
 * The four themes the design system ships: a brand (lyra, the default, is the
 * absence of a class; nova is `.nova` on `<html>`) in a color scheme (dark is
 * `.dark` on `<html>`). The names are the contexts of tokens/tokens.resolver.json.
 */
const THEMES = ["light", "dark", "nova-light", "nova-dark"] as const
type Theme = (typeof THEMES)[number]

/**
 * A test that repeats a walk or an audit in each theme does the work of a
 * single one four times: the budget of the two themes it had, doubled.
 */
export const EVERY_THEME_TIMEOUT = 30_000

/** Puts `<html>` in a theme. */
export function setTheme(theme: Theme) {
  const { classList } = document.documentElement
  classList.toggle("dark", theme.endsWith("dark"))
  classList.toggle("nova", theme.startsWith("nova"))
}

/** Runs `visit` in each theme, then gives `<html>` its classes back. */
export async function inEveryTheme(visit: (theme: Theme) => Promise<void>) {
  const { classList } = document.documentElement
  const initial = {
    dark: classList.contains("dark"),
    nova: classList.contains("nova"),
  }
  try {
    for (const theme of THEMES) {
      setTheme(theme)
      await visit(theme)
    }
  } finally {
    classList.toggle("dark", initial.dark)
    classList.toggle("nova", initial.nova)
  }
}
