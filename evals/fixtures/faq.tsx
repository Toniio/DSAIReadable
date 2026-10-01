// fails: compiles
// The design system's Accordion with a prop it does not have: it renders, but
// TypeScript rejects it.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Faq() {
  return (
    <Accordion type="single" collapsible variant="ghost">
      <AccordionItem value="billing">
        <AccordionTrigger>When am I billed?</AccordionTrigger>
        <AccordionContent>On the first day of each month.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
