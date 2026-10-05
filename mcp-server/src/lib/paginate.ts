import { z } from "zod"
import { fitting, MAX_ANSWER_CHARS } from "./answer-size.js"

const DEFAULT_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 200

/** The `limit` and `cursor` arguments of a paginated tool. */
export const pageParams = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .optional()
    .describe(`Default ${DEFAULT_PAGE_SIZE}`),
  cursor: z
    .string()
    .optional()
    .describe("The next_cursor of the previous page"),
}

export interface Page<T> {
  total: number
  items: T[]
  /** Absent on the last page. */
  next_cursor?: string
}

/**
 * One page of `items`. The cursor is opaque to the caller: it encodes the
 * offset of the next page, and a cursor this server did not issue is refused
 * rather than read as the first page. A page also ends before
 * MAX_ANSWER_CHARS, so `limit` is a maximum: a page of 200 tokens came to
 * 62,726 characters, the changelog's default page to 61,940.
 */
export function paginate<T>(
  items: T[],
  limit: number = DEFAULT_PAGE_SIZE,
  cursor?: string
): Page<T> {
  const offset = cursor === undefined ? 0 : decodeCursor(cursor, items.length)
  // The page around the items, at its longest: the total and a cursor.
  const envelope = JSON.stringify({
    total: items.length,
    items: [],
    next_cursor: encodeCursor(items.length),
  }).length
  const end =
    offset +
    fitting(items.slice(offset, offset + limit), MAX_ANSWER_CHARS - envelope)
  return {
    total: items.length,
    items: items.slice(offset, end),
    ...(end < items.length ? { next_cursor: encodeCursor(end) } : {}),
  }
}

function encodeCursor(offset: number): string {
  return Buffer.from(`offset:${offset}`).toString("base64url")
}

function decodeCursor(cursor: string, total: number): number {
  const match = /^offset:(\d+)$/.exec(
    Buffer.from(cursor, "base64url").toString()
  )
  const offset = match ? Number(match[1]) : NaN
  if (!Number.isSafeInteger(offset) || offset > total) {
    throw new Error(
      `Invalid cursor "${cursor}". Pass the next_cursor of the previous page unchanged, or omit cursor to start from the first page.`
    )
  }
  return offset
}
