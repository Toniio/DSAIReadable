import Example from "@/site/generated/examples/components/Message"
import type { Story } from "@/site/playground/types"

/** Message: the spec's example, until a scenario with controls is written. */
const story: Story = {
  controls: [],
  render: () => <Example />,
}

export default story
