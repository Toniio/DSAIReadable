---
"dsaireadable": patch
---

docs: the Overriding table of the Content foundation lists every default string, one row per `UI_STRINGS` key, with the prop that replaces it. It missed the two landmark names, `Breadcrumb` and `Pagination` (replaced through `aria-label`), and the `PaginationNext` defaults. `npm run index:strings` now fails when the table and `lib/ui-strings.ts` disagree. The site's Content page drops its Default strings table, which repeated the values without the props.
