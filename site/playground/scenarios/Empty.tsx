import Example from "@/site/generated/examples/components/Empty"
import type { Story } from "@/site/playground/types"

/** Empty: the spec's example, until a scenario with controls is written. */
const story: Story = {
  controls: [],
  render: () => <Example />,
}

export default story
