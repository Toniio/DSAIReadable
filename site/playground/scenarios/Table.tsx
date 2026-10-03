import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Args, Story } from "@/site/playground/types"

const INVOICES = [
  { id: "INV-001", status: "Paid", method: "Credit card", cents: 25000 },
  { id: "INV-002", status: "Pending", method: "Bank transfer", cents: 15000 },
  { id: "INV-003", status: "Unpaid", method: "PayPal", cents: 35000 },
  { id: "INV-004", status: "Paid", method: "Credit card", cents: 45000 },
  { id: "INV-005", status: "Paid", method: "PayPal", cents: 55000 },
  { id: "INV-006", status: "Pending", method: "Bank transfer", cents: 20000 },
  { id: "INV-007", status: "Unpaid", method: "Credit card", cents: 30000 },
  { id: "INV-008", status: "Paid", method: "Bank transfer", cents: 12500 },
]

const BADGE = {
  Paid: "success",
  Pending: "secondary",
  Unpaid: "warning",
} as const

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

function rows(args: Args) {
  const count = Math.min(INVOICES.length, Math.max(1, Number(args.rows) || 1))
  return INVOICES.slice(0, count)
}

function Invoices({ args }: { args: Args }) {
  const invoices = rows(args)
  const selectable = Boolean(args.selectable)
  // The second invoice starts selected, to show the selected row.
  const [selected, setSelected] = useState<string[]>(["INV-002"])
  const chosen = invoices.filter((invoice) => selected.includes(invoice.id))
  const all =
    chosen.length === invoices.length
      ? true
      : chosen.length > 0
        ? "indeterminate"
        : false
  const caption = String(args.caption).trim()
  const total = invoices.reduce((sum, invoice) => sum + invoice.cents, 0)

  return (
    <Table aria-label={caption ? undefined : "Invoices"}>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          {selectable ? (
            <TableHead>
              <Checkbox
                aria-label="Select all invoices"
                checked={all}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked === true
                      ? invoices.map((invoice) => invoice.id)
                      : []
                  )
                }
              />
            </TableHead>
          ) : null}
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead
            className={selectable ? "hidden sm:table-cell" : undefined}
          >
            Method
          </TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const isSelected = selectable && selected.includes(invoice.id)
          return (
            <TableRow
              key={invoice.id}
              data-state={isSelected ? "selected" : undefined}
            >
              {selectable ? (
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${invoice.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      setSelected((previous) =>
                        checked === true
                          ? [...previous, invoice.id]
                          : previous.filter((id) => id !== invoice.id)
                      )
                    }
                  />
                </TableCell>
              ) : null}
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>
                <Badge variant={BADGE[invoice.status as keyof typeof BADGE]}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell
                className={selectable ? "hidden sm:table-cell" : undefined}
              >
                {invoice.method}
              </TableCell>
              <TableCell className="text-right">
                {dollars(invoice.cents)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      {args.footer ? (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            {/* The Method column hides below sm: its footer cell hides with it. */}
            {selectable ? <TableCell className="hidden sm:table-cell" /> : null}
            <TableCell className="text-right">{dollars(total)}</TableCell>
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  )
}

/** Table: recent invoices, with a status, a total and selectable rows. */
const story: Story = {
  controls: [
    { kind: "text", name: "caption", default: "Recent invoices" },
    { kind: "number", name: "rows", default: 3, min: 1, max: INVOICES.length },
    { kind: "boolean", name: "footer", default: true },
    { kind: "boolean", name: "selectable", default: false },
  ],
  layout: "padded",
  render: (args) => <Invoices args={args} />,
  code: (args) => {
    const invoices = rows(args)
    const selectable = Boolean(args.selectable)
    const caption = String(args.caption).trim()
    const total = invoices.reduce((sum, invoice) => sum + invoice.cents, 0)
    const hidden = selectable ? ` className="hidden sm:table-cell"` : ""
    // One object per line, or one field per line past 80 columns, as Prettier does.
    const data = invoices
      .map((invoice) => {
        const fields = [
          `id: "${invoice.id}"`,
          `status: "${invoice.status}"`,
          `method: "${invoice.method}"`,
          `amount: "${dollars(invoice.cents)}"`,
        ]
        const line = `  { ${fields.join(", ")} },`
        return line.length <= 80
          ? line
          : `  {\n${fields.map((field) => `    ${field},`).join("\n")}\n  },`
      })
      .join("\n")
    const imports = [
      `import { Badge } from "@/components/ui/badge"`,
      selectable ? `import { Checkbox } from "@/components/ui/checkbox"` : "",
      `import {
  Table,
  TableBody,${caption ? "\n  TableCaption," : ""}
  TableCell,${args.footer ? "\n  TableFooter," : ""}
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"`,
    ].filter(Boolean)
    const footer = args.footer
      ? `
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>${selectable ? `\n          <TableCell className="hidden sm:table-cell" />` : ""}
          <TableCell className="text-right">${dollars(total)}</TableCell>
        </TableRow>
      </TableFooter>`
      : ""
    return `${selectable ? `import { useState } from "react"\n\n` : ""}${imports.join("\n")}

const invoices = [
${data}
] as const

const statusVariant = {
  Paid: "success",
  Pending: "secondary",
  Unpaid: "warning",
} as const

export function Example() {${
      selectable
        ? `
  const [selected, setSelected] = useState<string[]>(["INV-002"])
  const all =
    selected.length === invoices.length
      ? true
      : selected.length > 0
        ? "indeterminate"
        : false`
        : ""
    }
  return (
    <Table${caption ? "" : ` aria-label="Invoices"`}>${caption ? `\n      <TableCaption>${caption}</TableCaption>` : ""}
      <TableHeader>
        <TableRow>${
          selectable
            ? `
          <TableHead>
            <Checkbox
              aria-label="Select all invoices"
              checked={all}
              onCheckedChange={(checked) =>
                setSelected(
                  checked === true ? invoices.map((row) => row.id) : []
                )
              }
            />
          </TableHead>`
            : ""
        }
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead${hidden}>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow${
            selectable
              ? `
            key={invoice.id}
            data-state={selected.includes(invoice.id) ? "selected" : undefined}
          >
            <TableCell>
              <Checkbox
                aria-label={\`Select \${invoice.id}\`}
                checked={selected.includes(invoice.id)}
                onCheckedChange={(checked) =>
                  setSelected((previous) =>
                    checked === true
                      ? [...previous, invoice.id]
                      : previous.filter((id) => id !== invoice.id)
                  )
                }
              />
            </TableCell>`
              : ` key={invoice.id}>`
          }
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[invoice.status]}>
                {invoice.status}
              </Badge>
            </TableCell>
${
  selectable
    ? `            <TableCell className="hidden sm:table-cell">
              {invoice.method}
            </TableCell>`
    : `            <TableCell>{invoice.method}</TableCell>`
}
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>${footer}
    </Table>
  )
}
`
  },
}

export default story
