---
"dsaireadable": patch
---

docs: The Tools page of the MCP & Skills section now says what Claude Code (2.1.318) does with the arguments of the `build_screen` prompt: it gives one word to each of `task`, `context`, `device` and `mode`, so a request of several words never reaches `task`. From Claude Code, ask the agent for the screen in plain words, without the prompt's call budget; a client that fills a prompt's arguments in a form, or calls `prompts/get`, passes the whole request. How it works points to it.
