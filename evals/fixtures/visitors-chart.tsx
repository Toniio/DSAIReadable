// fails: axe
// A chart whose data table is hidden with sr-only: the Table's scroll container
// still scrolls inside its 1px box and holds nothing focusable, which axe
// reports as scrollable-region-focusable. The chart itself is named on its
// Recharts element, as the Chart spec asks.
import { Bar, BarChart, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const config: ChartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
}

const data = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
]

export default function VisitorsChart() {
  return (
    <div className="flex flex-col gap-2">
      <ChartContainer config={config} className="min-h-52 w-full">
        <BarChart accessibilityLayer aria-label="Desktop visitors" data={data}>
          <XAxis dataKey="month" />
          <Bar dataKey="desktop" fill="var(--color-desktop)" />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ChartContainer>
      <div className="sr-only">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Desktop</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell>{row.desktop}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
