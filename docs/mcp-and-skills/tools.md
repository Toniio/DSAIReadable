# Tools

The MCP server answers an agent through tools, resources and prompts. Every tool is read-only and answers from the context cache: each one is shown below with its definition as `tools/list` serves it, and what it answers to an example input.

## Prompts

A prompt opens a task on the server's workflow: the tools to call first, then the requirements of the result. `build_screen` sets the call budget of a new screen, which [How it works](./how-it-works.md) follows tool by tool.

<!-- site: prompts -->

## Why these tools

An agent that builds a screen asks the same questions in the same order: what the design system holds, how a component is used, which rules apply, which page pattern fits the task, which words to write, whether its code is right, and what changed since the version it knows. Each tool answers one of them. Depth goes through parameters, not through more tools.

**Every definition is sent with every request.** A client sends the name, description and input schema of each tool on every turn, whether the agent calls it or not. [#136](https://github.com/Toniio/DSAIReadable/pull/136) cut them from about 4,600 to about 3,900 tokens per turn, with the same facts.

## DS Core

What the design system holds and how to use it: the overview a session starts with, the components, one component's spec, the semantic tokens, the typography, the icons and the design rules.

<!-- site: ds-core -->

## Lifecycle

What to stop using and what changed: the deprecated tokens and component exports, each with its replacement, and the changelog, one entry per change.

<!-- site: lifecycle -->

## Patterns

How a page carries out a task: the page patterns, then one pattern's components, structure, spacing and copy. The server also serves a project's own patterns, from its `design/patterns/` folder.

<!-- site: patterns -->

## Dataviz

Which chart fits an objective, and how one chart type is built.

<!-- site: dataviz -->

## UX Writing

Which words to write: the voice and tone and content rules, the glossary, and example labels, placeholders and messages.

<!-- site: ux-writing -->

## Admin

Whether the code is right, and the design system's figures. An agent runs both validators on the screen it wrote, again after each fix, until both report no error: `dsaireadable_validate_screen` reads the code as text, `dsaireadable_validate_code` lints and type-checks it.

<!-- site: admin -->

## Resources

A client can attach the design system as context without calling a tool. Each resource is a JSON document. A component's whole spec, with its anatomy, tokens and states, is a resource rather than a tool answer: a screen that uses the component writes none of it.

<!-- site: resources -->
