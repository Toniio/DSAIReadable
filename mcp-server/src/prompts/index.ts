import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { COMPONENT_RULE } from "../lib/component-rule.js"
import { TAILWIND_RULE } from "../lib/tailwind-rule.js"

/**
 * The critical rules every prompt ends with, rendered from the objects
 * get_design_rules serves. A hand-written copy lived here and had drifted
 * from them: one source, two renderings.
 */
const CRITICAL_RULES_TEXT = [
  `**CRITICAL STYLING RULE — ${TAILWIND_RULE.title}:**`,
  ...TAILWIND_RULE.description.map((d) => `- ${d}`),
  `- Do: ${TAILWIND_RULE.do.join(" · ")}`,
  ...TAILWIND_RULE.dont.map((d) => `- Don't: ${d}`),
  "",
  `**CRITICAL COMPONENT RULE — ${COMPONENT_RULE.title}:**`,
  ...COMPONENT_RULE.description.map((d) => `- ${d}`),
  ...Object.entries(COMPONENT_RULE.mandatory_mappings).map(
    ([element, rule]) => `- ${element}: ${rule}`
  ),
  ...COMPONENT_RULE.page_structure.map((d) => `- ${d}`),
].join("\n")

export function registerPrompts(server: McpServer): void {
  // 1. build_screen
  server.prompt(
    "build_screen",
    "Generate a complete React screen using only DS components and tokens",
    {
      task: z.string().describe("Description of the screen to build"),
      context: z
        .string()
        .optional()
        .describe("Additional context about the screen"),
      device: z.enum(["desktop", "mobile", "tablet"]).describe("Target device"),
      mode: z.enum(["light", "dark"]).describe("Color mode"),
    },
    async ({ task, context, device, mode }) => {
      const contextLine = context ? `\nAdditional context: ${context}` : ""
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `You are a senior frontend developer working with the DSAIReadable Design System.

**Protocol — call budget: 4 calls + 1 per component you retain:**
1. \`get_design_system_overview\` — setup, imports, categories
2. \`get_components\` — filtered by \`category\` when the task names one; pick the components the screen needs, and only those
3. \`get_design_rules\` — the composition rules and the critical rules
4. For each retained component only: \`get_component_specs\` (component_name: <name>, response_format: "detailed"), or read the resource \`ds://component/<name>/spec\`. Its props list every variant value: no \`get_component_variants\` call is needed
5. Generate the screen, then call \`validate_screen\` with the code. Fix every error it reports and validate again

On demand only, outside the budget: \`get_tokens\` (category) for a token the rules do not name, \`get_content_library\` for label, placeholder and message examples, \`get_glossary\` for a domain term.

Task: ${task}${contextLine}
Target device: ${device}
Color mode: ${mode}

Requirements:
- MANDATORY: Import each component from its own module, e.g. \`import { Button } from "@/components/ui/button"\` and \`import { Card, CardContent } from "@/components/ui/card"\`
- Import the \`cn\` helper from \`@/lib/utils\` when you need to merge classes
- NEVER import a stylesheet: \`styles/globals.css\` already imports \`tokens.css\` and bridges it into Tailwind v4
- Use DS components for every element they cover — never a raw <button>, <input>, <select>, <textarea>, <table>, <dialog>, <a>, <label>, <h1>–<h6> or <svg>. A <div> is fine for layout (flex, grid); a content section is a <Card>
- Use ONLY DS tokens via Tailwind classes (no raw hex colors, no arbitrary Tailwind values)
- Follow the composition rules (step 3) and the constraints of each retained spec (step 4)
- Ensure the layout is responsive for ${device}
- One semantic class serves both color modes: it resolves to its ${mode} value ${mode === "dark" ? "under the `.dark` class on `<html>`" : "when `<html>` has no `.dark` class"}. Never pick a color per mode
- Include all necessary imports
- Generate complete, production-ready TSX code

${CRITICAL_RULES_TEXT}`,
            },
          },
        ],
      }
    }
  )

  // 2. revise_design
  server.prompt(
    "revise_design",
    "Revise a specific component or element in the current design",
    {
      target: z.string().describe("The component or element to change"),
      change: z.string().describe("What to change about it"),
    },
    async ({ target, change }) => {
      const isTextChange =
        /text|label|title|copy|wording|message|placeholder|content/i.test(
          change
        )
      const uxWritingInstruction = isTextChange
        ? "\n3. `get_ux_writing_rules` — since this involves text changes"
        : ""

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `You are a senior frontend developer working with the DSAIReadable Design System.

**BEFORE making any changes, you MUST call these tools:**
1. \`get_component_specs\` (component_name: "${target}", response_format: "detailed") — to understand the component's full spec
2. \`get_component_variants\` (component_name: "${target}") — to understand available variants${uxWritingInstruction}

**Only after gathering this information, suggest the revision.**

Target element: ${target}
Requested change: ${change}

Requirements:
- Maintain DS compliance — only use tokens and DS components
- Show the before/after diff clearly
- Explain why the change is correct per the DS rules
- If the requested change violates DS rules, explain what to do instead

${CRITICAL_RULES_TEXT}`,
            },
          },
        ],
      }
    }
  )

  // 3. generate_idea
  server.prompt(
    "generate_idea",
    "Generate a screen/feature idea using DS components and patterns",
    {
      experience: z
        .string()
        .optional()
        .describe("Type of experience (e.g. onboarding, dashboard, form)"),
      industry: z
        .string()
        .optional()
        .describe("Industry context (e.g. energy, utilities)"),
    },
    async ({ experience, industry }) => {
      const expLine = experience ? `\nExperience type: ${experience}` : ""
      const indLine = industry ? `\nIndustry: ${industry}` : ""

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `You are a senior Product Designer working with the DSAIReadable Design System.

**BEFORE generating ideas, you MUST call these tools:**
1. \`get_components\` — to see all available components
2. \`get_design_rules\` — to understand design constraints
3. \`get_page_patterns\` — to see established layout patterns
4. \`get_design_system_overview\` — to understand the DS capabilities

**Only after gathering this information, generate the idea.**
${expLine}${indLine}

Generate a creative but DS-compliant screen or feature idea that:
- Uses only components available in the DS
- Follows the established page layout patterns
- Respects all design rules and constraints
- Includes a description, wireframe sketch (in text/ASCII), and a list of DS components used
- Suggests specific component variants and token usage

${CRITICAL_RULES_TEXT}`,
            },
          },
        ],
      }
    }
  )

  // 4. suggest_next_steps
  server.prompt(
    "suggest_next_steps",
    "Suggest next steps or screens based on the current screen context",
    {
      current_screen: z.string().describe("Description of the current screen"),
    },
    async ({ current_screen }) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `You are a senior Product Designer and UX strategist working with the DSAIReadable Design System.

**BEFORE suggesting next steps, you MUST call these tools:**
1. \`get_components\` — to see all available components
2. \`get_content_library\` — for standard content patterns
3. \`get_ux_writing_rules\` — for writing guidelines
4. \`get_page_patterns\` — for established layout patterns

**Only after gathering this information, suggest next steps.**

Current screen: ${current_screen}

Suggest 3-5 logical next steps or screens that:
- Follow naturally from the current screen's user journey
- Use only DS components and patterns
- Include specific component recommendations for each suggestion
- Consider UX writing rules for all CTAs and labels
- Provide a brief rationale for each suggestion

${CRITICAL_RULES_TEXT}`,
            },
          },
        ],
      }
    }
  )

  // 5. showcase_components
  server.prompt(
    "showcase_components",
    "Generate a showcase/storybook-like view of DS components",
    {
      category: z
        .string()
        .optional()
        .describe("Component category to showcase (or all if omitted)"),
      device: z
        .enum(["desktop", "mobile", "tablet"])
        .describe("Target device for the showcase"),
    },
    async ({ category, device }) => {
      const categoryLine = category
        ? `\nCategory filter: ${category}`
        : "\nShow all categories"

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `You are a senior frontend developer creating a component showcase for the DSAIReadable Design System.

**BEFORE generating the showcase, you MUST call these tools:**
1. \`get_design_system_overview\` — to understand the DS scope
2. \`get_components\`${category ? ` (category: "${category}")` : ""} — to get the component list
3. For each component found, call:
   - \`get_component_specs\` (component_name: <name>, response_format: "detailed") — full specs
   - \`get_component_variants\` (component_name: <name>) — all variants
4. \`get_tokens\` — to get all design tokens
5. \`get_design_rules\` — to ensure showcase follows rules

**Only after gathering all this information, generate the showcase.**
${categoryLine}
Target device: ${device}

Generate a complete React page that showcases each component with:
- All variants displayed side by side
- Proper token usage demonstrated
- Dark/light mode examples
- Interactive states (hover, focus, disabled)
- Code snippets for each variant
- Layout optimized for ${device}
- Only DS components and tokens used

${CRITICAL_RULES_TEXT}`,
            },
          },
        ],
      }
    }
  )
}
