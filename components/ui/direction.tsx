"use client"

import * as React from "react"
import { Direction } from "radix-ui"

function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
}) {
  // no-data-slot: DirectionProvider is a React context provider. It renders no
  // DOM node of its own - only its children - so there is no element to carry
  // the attribute. Target the direction through the dir attribute Radix sets on
  // the elements that consume the context.
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>
      {children}
    </Direction.DirectionProvider>
  )
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }

export type DirectionProviderProps = React.ComponentProps<
  typeof DirectionProvider
>
