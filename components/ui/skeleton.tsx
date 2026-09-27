import { cn } from "@/lib/utils"

import type { ComponentProps } from "react"
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

export type SkeletonProps = ComponentProps<typeof Skeleton>
