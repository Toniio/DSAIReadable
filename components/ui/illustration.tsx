import * as React from "react"
import { cn } from "@/lib/utils"

import { UI_STRINGS } from "@/lib/ui-strings"
function Illustration({
  className,
  alt = UI_STRINGS.illustration.alt,
  ...props
}: React.ComponentProps<"div"> & { alt?: string }) {
  return (
    <div
      data-slot="illustration"
      role="img"
      aria-label={alt}
      className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        className="size-48 opacity-20"
        aria-hidden="true"
      >
        <rect
          x="40"
          y="40"
          width="320"
          height="320"
          rx="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="8 4"
        />
        <path
          d="M160 260l40-80 40 80M180 240h40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="200"
          cy="160"
          r="24"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M120 300h160"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  )
}

export { Illustration }

export type IllustrationProps = React.ComponentProps<typeof Illustration>
