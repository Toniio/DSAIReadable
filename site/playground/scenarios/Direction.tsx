import { useId } from "react"

import { Badge } from "@/components/ui/badge"
import { DirectionProvider, useDirection } from "@/components/ui/direction"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Story } from "@/site/playground/types"

type Dir = "ltr" | "rtl"

function CurrentDirection() {
  const direction = useDirection()
  return <Badge variant="secondary">Reading direction: {direction}</Badge>
}

function Section({ dir }: { dir: Dir }) {
  const volume = useId()
  return (
    <DirectionProvider dir={dir}>
      <div dir={dir} className="flex w-sm max-w-full flex-col gap-6">
        <CurrentDirection />
        <div className="flex flex-col gap-3">
          <Label id={volume}>Volume</Label>
          <Slider defaultValue={[30]} max={100} aria-labelledby={volume} />
        </div>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="text-xs">
            The slider fills from the start edge, and the arrow keys follow the
            reading direction.
          </TabsContent>
          <TabsContent value="billing" className="text-xs">
            Your plan renews on the first of each month.
          </TabsContent>
        </Tabs>
      </div>
    </DirectionProvider>
  )
}

/** Direction: Radix parts that read it, a slider and tabs, in either direction. */
const story: Story = {
  controls: [
    { kind: "select", name: "dir", options: ["ltr", "rtl"], default: "ltr" },
  ],
  render: (args) => <Section dir={args.dir === "rtl" ? "rtl" : "ltr"} />,
  code: (args) => {
    const dir = args.dir === "rtl" ? "rtl" : "ltr"
    return `import { Badge } from "@/components/ui/badge"
import { DirectionProvider, useDirection } from "@/components/ui/direction"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CurrentDirection() {
  const direction = useDirection()
  return <Badge variant="secondary">Reading direction: {direction}</Badge>
}

export function Example() {
  return (
    <DirectionProvider dir="${dir}">
      <div dir="${dir}" className="flex w-sm max-w-full flex-col gap-6">
        <CurrentDirection />
        <div className="flex flex-col gap-3">
          <Label id="volume">Volume</Label>
          <Slider defaultValue={[30]} max={100} aria-labelledby="volume" />
        </div>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="text-xs">
            The slider fills from the start edge, and the arrow keys follow the
            reading direction.
          </TabsContent>
          <TabsContent value="billing" className="text-xs">
            Your plan renews on the first of each month.
          </TabsContent>
        </Tabs>
      </div>
    </DirectionProvider>
  )
}
`
  },
}

export default story
