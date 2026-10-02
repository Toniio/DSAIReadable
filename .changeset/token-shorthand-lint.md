---
"dsaireadable": patch
---

lint: `no-raw-values` answers a bracketed CSS variable (`hover:w-[var(--x)]`, and the Tailwind v3 `w-[--x]`) with a new message, `variableShorthand`, that names the corrected class with its variants (`hover:w-(--x)`), where it named only `w-[var(--x)]` as an arbitrary value, variants dropped. `configs.tailwind` turns on `better-tailwindcss/enforce-consistent-variable-syntax`, so `eslint --fix` writes the shorthand (a bracketed variable is now reported by both rules in `recommended`, and the one `--fix` clears both; `core` reports it once): measured on `components/`, `lib/`, `hooks/` and on 106 tsx and ts blocks of the specs, foundations, page patterns, harness examples and skills, it adds no error to code that passes today.
