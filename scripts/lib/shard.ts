/**
 * The shards of `npm run site:test` (scripts/test-site.ts): CI loads the
 * documentation site on three runners, each taking one shard of the loads.
 * No side effect: importing it loads nothing.
 */

/** One shard of a run: the `index`-th of `count`, counted from 1. */
interface Shard {
  index: number
  count: number
}

/**
 * Reads the value of `--shard=<i>/<n>`: two whole numbers, with
 * 1 <= i <= n. Anything else throws, naming the value and the expected form.
 */
export function parseShard(value: string): Shard {
  const match = /^([1-9]\d*)\/([1-9]\d*)$/.exec(value)
  const index = Number(match?.[1])
  const count = Number(match?.[2])
  if (!match || index > count)
    throw new Error(
      `the shard "${value}" is not <i>/<n> with 1 <= i <= n: --shard=2/3 runs the second of three shards.`
    )
  return { index, count }
}

/**
 * The items of one shard, in their original order. The items of a group stay
 * in one shard: for the site, a route's loads, light and dark, so the focus
 * indicators it measures once per element and theme are still measured once
 * within a shard. A group costs its number of items, and the groups are dealt
 * the costliest first (then by name), each to the shard with the lowest cost
 * so far (the lowest-numbered one on a tie): the same items always make the
 * same shards, and every group lands in exactly one.
 */
export function shard<T>(
  items: T[],
  groupOf: (item: T) => string,
  { index, count }: Shard
): T[] {
  const groups = new Map<string, number>()
  for (const item of items) {
    const name = groupOf(item)
    groups.set(name, (groups.get(name) ?? 0) + 1)
  }
  const dealt = [...groups].sort(
    ([a, costA], [b, costB]) => costB - costA || (a < b ? -1 : a > b ? 1 : 0)
  )
  const costs = Array.from({ length: count }, () => 0)
  const mine = new Set<string>()
  for (const [name, cost] of dealt) {
    const lightest = costs.indexOf(Math.min(...costs))
    costs[lightest] += cost
    if (lightest === index - 1) mine.add(name)
  }
  return items.filter((item) => mine.has(groupOf(item)))
}
