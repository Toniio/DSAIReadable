---
"dsaireadable": minor
---

mcp: The MCP server serves two new specs, `CodeBlock` and `Trace`, and composition rule `rule-23` gives each one its job in a conversation: code in an answer is a `CodeBlock`, in one color, inside a `ghost` or `outline` `Bubble`, with its copy button in `CodeBlockActions`; every step of the assistant's work (a tool call, its reasoning, a search), running, failed or done, with details or without, is a `Trace` step; an event that is not a step (a date, a resumed session) stays a `Marker`. `shadcn_excluded` lists `form` alone.
