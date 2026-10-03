---
"dsaireadable": patch
---

docs: the code examples of two specs now type-check as written. Direction passes `dir="rtl"` to `DirectionProvider`, whose Radix `dir` prop is required, where it passed `direction="rtl"` alone; Logo's `Example` gives `brandName` a default (`"Acme"`), so it renders with no props, as the tests and the documentation site render it.
