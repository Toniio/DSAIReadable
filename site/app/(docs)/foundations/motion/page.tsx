import type { Metadata } from "next"

import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import {
  MotionDemo,
  type MotionRow,
} from "@/site/foundation-docs/spec-pages/motion-demo"
import { Code } from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import {
  tailwindClasses,
  tokenByName,
  tokenGroup,
  type Token,
} from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("motion")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [
  { id: "duration-scale", label: "Duration scale" },
  { id: "easing-curves", label: "Easing curves" },
]

/** The token the other axis is held at while one axis varies. */
const HELD_EASING = "motion.easing.default"
const HELD_DURATION = "motion.duration.extra-slow"

function row(entry: Token, duration: Token, easing: Token): MotionRow {
  return {
    token: entry.token,
    value: entry.value.light,
    className: tailwindClasses(entry.cssVar)[0],
    status: entry.status,
    duration: duration.cssVar,
    easing: easing.cssVar,
  }
}

export default function MotionPage() {
  const durations = tokenGroup("motion.duration")
  const easings = tokenGroup("motion.easing")
  const heldEasing = tokenByName(HELD_EASING) ?? easings[0]
  const heldDuration =
    tokenByName(HELD_DURATION) ?? durations[durations.length - 1]

  return (
    <FoundationPage slug="motion" sections={SECTIONS}>
      <DocSection
        id="duration-scale"
        title="Duration scale"
        description={
          <>
            {durations.length} durations, each played on{" "}
            <Code>{heldEasing.token}</Code>. A transition with no duration class
            runs at <Code>duration-fast</Code>.
          </>
        }
      >
        <MotionDemo
          label="the durations"
          rows={durations.map((entry) => row(entry, entry, heldEasing))}
        />
      </DocSection>

      <DocSection
        id="easing-curves"
        title="Easing curves"
        description={
          <>
            {easings.length} curves, each played over{" "}
            <Code>{heldDuration.token}</Code> ({heldDuration.value.light}) so
            the shape shows. With reduced motion, the squares fade in place
            instead.
          </>
        }
      >
        <MotionDemo
          label="the easings"
          rows={easings.map((entry) => row(entry, heldDuration, entry))}
        />
      </DocSection>
    </FoundationPage>
  )
}
