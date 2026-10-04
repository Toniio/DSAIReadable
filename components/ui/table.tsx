"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The root of a semantic data table that scrolls sideways inside its container; use it for rows that share the same columns.
 *
 * @example
 * <Table>
 *   <TableCaption>Recent invoices</TableCaption>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Invoice 1042</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </div>
  )
}

/**
 * The group of header rows of a `Table`, which lets assistive technology tell the column names from the data.
 *
 * @example
 * <TableHeader>
 *   <TableRow>
 *     <TableHead>Customer</TableHead>
 *     <TableHead>Amount</TableHead>
 *   </TableRow>
 * </TableHeader>
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

/**
 * The group that holds the data rows of a `Table`.
 *
 * @example
 * <TableBody>
 *   <TableRow>
 *     <TableCell>Ada Lovelace</TableCell>
 *     <TableCell>$250.00</TableCell>
 *   </TableRow>
 * </TableBody>
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

/**
 * The summary rows at the end of a `Table`, such as totals or averages, set apart from the data rows.
 *
 * @example
 * <TableFooter>
 *   <TableRow>
 *     <TableCell>Total</TableCell>
 *     <TableCell>$250.00</TableCell>
 *   </TableRow>
 * </TableFooter>
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * One row of a `Table`; it highlights on hover and when `data-state="selected"`.
 *
 * @example
 * <TableRow data-state="selected">
 *   <TableCell>Ada Lovelace</TableCell>
 *   <TableCell>$250.00</TableCell>
 * </TableRow>
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-overlay-hover has-aria-expanded:bg-overlay-selected data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

/**
 * A column or row header cell of a `Table` that names the data it labels.
 *
 * @example
 * <TableRow>
 *   <TableHead>Customer</TableHead>
 *   <TableHead>Amount</TableHead>
 * </TableRow>
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * A data cell of a `Table` row that holds one value.
 *
 * @example
 * <TableRow>
 *   <TableCell>Ada Lovelace</TableCell>
 *   <TableCell>$250.00</TableCell>
 * </TableRow>
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * The visible title of a `Table` that names it for everyone, including screen reader users.
 *
 * @example
 * <Table>
 *   <TableCaption>A list of your recent invoices.</TableCaption>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Invoice 1042</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

export type TableProps = React.ComponentProps<typeof Table>
export type TableBodyProps = React.ComponentProps<typeof TableBody>
export type TableCaptionProps = React.ComponentProps<typeof TableCaption>
export type TableCellProps = React.ComponentProps<typeof TableCell>
export type TableFooterProps = React.ComponentProps<typeof TableFooter>
export type TableHeadProps = React.ComponentProps<typeof TableHead>
export type TableHeaderProps = React.ComponentProps<typeof TableHeader>
export type TableRowProps = React.ComponentProps<typeof TableRow>
