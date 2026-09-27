import * as React from "react"
import { cn } from "@/lib/utils"

function Logo({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "default" | "lg" }) {
  return (
    <div
      data-slot="logo"
      data-size={size}
      className={cn(
        "inline-flex items-center gap-2 font-heading font-bold tracking-tight select-none",
        "data-[size=default]:text-xl data-[size=lg]:text-2xl data-[size=sm]:text-base",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-none bg-primary text-primary-foreground",
          "data-[size=default]:size-9 data-[size=lg]:size-11 data-[size=sm]:size-7"
        )}
        data-size={size}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-5 data-[size=lg]:size-6 data-[size=sm]:size-4"
          data-size={size}
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
    </div>
  )
}

export { Logo }

export type LogoProps = React.ComponentProps<typeof Logo>
