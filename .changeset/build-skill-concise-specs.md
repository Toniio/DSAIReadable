---
"dsaireadable": minor
---

skills: `dsaireadable-build` reads each component's concise spec, all in the same turn, and asks for `detailed` only for a composed component whose structure its constraints do not settle (`Sidebar`, `Combobox`, `Chart`), for a prop, variant or size a constraint names, or for a validation error the concise spec cannot fix. It used to read one detailed spec per component, about five times the size. An estimate on the 0.1.3 skills run, its detailed spec calls answered concise by this checkout: 15 to 20 % fewer input tokens per screen; the 0.3.0 evals measure it. `dsaireadable-ui-guard` opens only the reference file of the line it cannot decide, and says that a spec's concise answer holds its limits.
