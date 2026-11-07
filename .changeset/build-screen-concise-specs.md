---
"dsaireadable": minor
---

mcp: The `build_screen` prompt asks for each retained component's spec in the default concise format, and for `response_format: "detailed"` only for a component whose props or variants the screen sets (a Button's `variant` or `size`, a Badge's `variant`). It asked for a detailed spec per component. Measured with claude-sonnet-5-5 on the 26 eval tasks, three passes started from each text: 7.5k fewer input tokens per screen paired by task, 21 of 26 tasks cheaper, 75 of 78 screens passed against 73 of 78, and 39 % of the spec calls detailed instead of 99.8 %.
