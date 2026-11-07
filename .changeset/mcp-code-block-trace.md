---
"dsaireadable": minor
---

mcp: The MCP server serves two new specs, `CodeBlock` and `Trace`, and composition rule `rule-23` gives each one its job in a conversation: code in an answer is a `CodeBlock`, in one color, with its copy button in `CodeBlockActions`; a step of the assistant's work that has a status or details to open (a tool call, its reasoning, its sources) is a `Trace` step; an event nobody said, with nothing to open, stays a `Marker`. `shadcn_excluded` lists `form` alone.
