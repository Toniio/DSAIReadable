import { Badge } from "@/components/ui/badge"

/** A check's outcome: pass, fail, or not run when its stage did not run. */
export function ResultBadge({ pass }: { pass: boolean | null }) {
  if (pass === null) return <Badge variant="outline">Not run</Badge>
  return pass ? (
    <Badge variant="success">Pass</Badge>
  ) : (
    <Badge variant="destructive">Fail</Badge>
  )
}
