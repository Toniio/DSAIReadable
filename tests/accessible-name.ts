import { cdp } from "vitest/browser"

interface DomNode {
  backendNodeId: number
  attributes?: string[]
  children?: DomNode[]
  contentDocument?: DomNode
  shadowRoots?: DomNode[]
}

function findById(node: DomNode, id: string): DomNode | undefined {
  const attributes = node.attributes ?? []
  for (let i = 0; i < attributes.length; i += 2)
    if (attributes[i] === "id" && attributes[i + 1] === id) return node
  for (const child of [
    ...(node.children ?? []),
    ...(node.contentDocument ? [node.contentDocument] : []),
    ...(node.shadowRoots ?? []),
  ]) {
    const found = findById(child, id)
    if (found) return found
  }
  return undefined
}

/**
 * The name Chromium's accessibility tree gives an element, the one a screen
 * reader announces, read over the DevTools protocol. Testing Library's
 * `getByRole(role, { name })` computes names with dom-accessibility-api, which
 * can disagree with the browser: a `role="group"` inside a `<label>` empties
 * the name Chromium gives the label's control, and dom-accessibility-api
 * still finds one.
 *
 * The element is found by its `id`: the test page runs in an iframe, which the
 * protocol's document tree reaches through `contentDocument`.
 */
export async function chromiumName(element: Element): Promise<string> {
  if (!element.id) throw new Error("chromiumName: the element needs an id")
  const session = cdp()
  const { root } = (await session.send("DOM.getDocument", {
    depth: -1,
    pierce: true,
  })) as { root: DomNode }
  const node = findById(root, element.id)
  if (!node) throw new Error(`chromiumName: no #${element.id} in the page`)
  const { nodes } = (await session.send("Accessibility.getPartialAXTree", {
    backendNodeId: node.backendNodeId,
    fetchRelatives: false,
  })) as { nodes: { name?: { value?: string } }[] }
  return nodes[0]?.name?.value ?? ""
}
