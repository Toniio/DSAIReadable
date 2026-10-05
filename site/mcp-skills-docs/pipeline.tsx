import type { PipelineStep } from "@/site/mcp-skills-docs/data"

/**
 * From the sources to the agent, one numbered row per step. A list of rows
 * reads at every width, where five columns would leave each step a few words
 * per line.
 */
export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="flex flex-col gap-px border bg-border">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="grid gap-2 bg-background p-4 sm:grid-cols-3 sm:gap-4"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
            >
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-medium">{step.title}</span>
              <code className="font-mono text-xs break-words text-muted-foreground">
                {step.where}
              </code>
            </div>
          </div>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed sm:col-span-2">
            {step.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}
