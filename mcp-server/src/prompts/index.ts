import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

const TAILWIND_RULE = `
**CRITICAL STYLING RULE — Tailwind CSS + DS Tokens:**
- ALWAYS use standard Tailwind CSS utility classes mapped to the design system tokens.
- Use semantic color classes: bg-background, text-foreground, bg-primary, text-primary-foreground, bg-muted, text-muted-foreground, border-border, bg-card, bg-destructive, etc.
- Use standard Tailwind spacing (p-4, gap-6, m-2), radius (rounded-lg, rounded-md), shadows (shadow-sm, shadow-md), and typography (text-sm, font-medium).
- NEVER use arbitrary values like bg-[#432dd7], p-[1.5rem], or rounded-[0.625rem].
- NEVER use Tailwind's default color palette (bg-violet-600, text-slate-500) — always use the DS semantic classes.
- NEVER use inline styles or direct CSS variable references in JSX.

**CRITICAL COMPONENT RULE — Use DS Components, NOT raw HTML:**
- ALWAYS use DS React components, imported one per module from @/components/ui/<name>.
- Use <Card> for content sections — NOT raw <div> with border/shadow.
- Use <Heading> for titles — NOT raw <h1>/<h2>/<h3>.
- Use <Button> for actions/CTAs — NOT raw <button> or styled <a>.
- Use <Input>, <Label>, <Checkbox>, <Select> for forms — NOT raw form elements.
- Use <Field>, <FieldLabel>, <FieldError> for form groups — NOT raw <div> + <label>.
- Use <Separator> — NOT <hr> or border classes.
- Use <Item> for list items, <Badge> for status indicators, <Avatar> for user pictures.
- Use <Empty> for empty states, <Skeleton>/<Spinner> for loading.
- Use @phosphor-icons/react for icons — NOT raw <svg>.
- Root container MUST always have: className="min-h-screen bg-background text-foreground"
`

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

**BEFORE generating any code, you MUST call these tools in order:**
1. \`get_design_rules\` — to understand all design constraints
2. \`get_components\` — to see available components
3. \`get_component_specs\` — for each component you plan to use
4. \`get_component_variants\` — for each component you plan to use
5. \`get_tokens\` (category: "color") — for color tokens
6. \`get_tokens\` (category: "space") — for spacing tokens
7. \`get_tokens\` (category: "typography") — for typography tokens
8. \`get_ux_writing_rules\` — for all text and copy
9. \`get_glossary\` — for correct terminology

**Only after gathering all this information, generate the screen.**

Task: ${task}${contextLine}
Target device: ${device}
Color mode: ${mode}

Requirements:
- MANDATORY: Import each component from its own module, e.g. \`import { Button } from "@/components/ui/button"\` and \`import { Card, CardContent } from "@/components/ui/card"\`
- Import the \`cn\` helper from \`@/lib/utils\` when you need to merge classes
- NEVER import a stylesheet: \`app/globals.css\` already imports \`tokens.css\` and bridges it into Tailwind v4
- Use ONLY DS components — NEVER raw HTML elements (no raw <div>, <h1>, <button>, <input>, <svg>)
- Use ONLY DS tokens via Tailwind classes (no raw hex colors, no arbitrary Tailwind values)
- Follow all design rules and composition patterns
- Apply correct UX writing rules for all labels, placeholders, and messages
- Ensure the layout is responsive for ${device}
- Use ${mode} mode color tokens
- Include all necessary imports
- Generate complete, production-ready TSX code
${TAILWIND_RULE}`,
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
${TAILWIND_RULE}`,
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
${TAILWIND_RULE}`,
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
${TAILWIND_RULE}`,
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
${TAILWIND_RULE}`,
            },
          },
        ],
      }
    }
  )
}
