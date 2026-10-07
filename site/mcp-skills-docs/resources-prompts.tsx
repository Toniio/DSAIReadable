import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  PromptRecord,
  ResourceRecord,
} from "@/site/mcp-skills-docs/tools-data"

const number = (value: number) => value.toLocaleString("en-US")

/** How many of the entries of resources/list a resource accounts for. */
function listed(resource: ResourceRecord): string {
  if (resource.listed === 0) return "Not listed"
  return resource.uri ? "Listed" : `${number(resource.listed)} listed`
}

/** The resources: their URI, what each returns, and the size of one read. */
export function ResourceTable({ resources }: { resources: ResourceRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URI</TableHead>
          <TableHead>Returns</TableHead>
          <TableHead>In resources/list</TableHead>
          <TableHead>One read</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <TableRow key={resource.name}>
            <TableCell className="align-top">
              <span className="flex flex-col gap-1">
                <code className="font-mono">
                  {resource.uriTemplate ?? resource.uri}
                </code>
                <span className="text-muted-foreground">{resource.title}</span>
              </span>
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              {resource.description}
            </TableCell>
            <TableCell className="align-top">{listed(resource)}</TableCell>
            <TableCell className="align-top">
              <span className="flex flex-col gap-1">
                <code className="font-mono">{resource.example.uri}</code>
                <span className="text-muted-foreground tabular-nums">
                  {number(resource.example.chars)} tokens
                </span>
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** The prompts, their arguments, and the call budget build_screen sets. */
export function PromptTable({
  prompts,
  budget,
}: {
  prompts: PromptRecord[]
  budget: string
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prompt</TableHead>
          <TableHead>What it opens</TableHead>
          <TableHead>Arguments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prompts.map((prompt) => (
          <TableRow key={prompt.name}>
            <TableCell className="align-top">
              <code className="font-mono">{prompt.name}</code>
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <span className="flex flex-col gap-1">
                <span>{prompt.description}</span>
                {prompt.name === "build_screen" ? (
                  <span className="text-muted-foreground">
                    Call budget: {budget}
                  </span>
                ) : null}
              </span>
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <ul className="flex flex-col gap-1">
                {prompt.arguments.map((argument) => (
                  <li key={argument.name}>
                    <code className="font-mono">{argument.name}</code>
                    {argument.required ? "" : " (optional)"}
                    {argument.description ? (
                      <span className="text-muted-foreground">
                        {" "}
                        {argument.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
