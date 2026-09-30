/**
 * The critical rule dsaireadable_get_design_rules serves with every answer, beside
 * TAILWIND_RULE: build a screen from the design system's components, never
 * from raw HTML elements.
 */
export const COMPONENT_RULE = {
  id: "use-ds-components",
  severity: "critical",
  title: "ALWAYS use DS React components — NEVER use raw HTML elements",
  description: [
    "The design system provides pre-built React components that enforce tokens, accessibility, and visual consistency.",
    "ALWAYS prefer DS components over raw HTML elements. Every visual element should come from @/components/ui/<name>.",
  ],
  mandatory_mappings: {
    "Content sections / containers":
      "Use <Card>, <CardHeader>, <CardContent>, <CardFooter> — NOT a raw <div> with a border or a shadow (a <div> for layout, flex or grid, is fine)",
    "Titles / headings": "Use <Heading> component — NOT raw <h1>, <h2>, <h3>",
    "Buttons / CTAs":
      "Use <Button> component with variant prop — NOT raw <button> or <a> styled as button",
    "Form fields":
      "Use <Input>, <Label>, <Checkbox>, <Select>, <Textarea>, <RadioGroup> — NOT raw <input>",
    "Form groups":
      "Use <Field>, <FieldLabel>, <FieldDescription>, <FieldError> — NOT raw <div> + <label>",
    "Links with icon":
      "Use <Button variant='link'> or <Button variant='ghost'> — NOT raw <a>",
    Separators: "Use <Separator> — NOT raw <hr> or border-b",
    "Loading / empty states":
      "Use <Skeleton>, <Spinner>, <Empty> — NOT custom loading divs",
    "Modals / dialogs":
      "Use <Dialog> or <AlertDialog> — NOT custom overlay divs",
    Icons: "Use @phosphor-icons/react — NOT raw <svg> elements",
    Navigation:
      "Use <NavigationMenu>, <Breadcrumb>, <Tabs> — NOT raw <nav> + <a>",
    Tooltips: "Use <Tooltip> — NOT title attribute",
    "Lists of items":
      "Use <Item>, <ItemHeader>, <ItemContent> — NOT raw <li> or <div>",
    "Data display": "Use <Table>, <Badge>, <Avatar> — NOT custom layouts",
    Notifications:
      "Use <Alert>, Toaster (sonner) — NOT custom notification divs",
  },
  page_structure: [
    "Root container MUST have: className='min-h-screen bg-background text-foreground'",
    "Every page MUST set bg-background and text-foreground on the outermost element",
    "Wrap content sections in <Card> components for visual grouping",
    "Use <Heading> for all titles with proper level (1-4)",
    "All interactive elements MUST be DS components (Button, Input, etc.)",
  ],
}
