import { readJson } from "@/site/lib/repo"

interface DsMetadata {
  name: string
  description: string
  design_system_version: string
  mcp_server_version: string
  registry_source: {
    repository: string
    registry: string
    item_address: string
  }
  stack: Record<string, string>
  framework: string
}

/** The design system's metadata, as the MCP server serves it. */
export const META = readJson<DsMetadata>("mcp-server/context/ds-metadata.json")

/** The released version this build documents: `0.1.2`. */
export const VERSION = META.design_system_version

/** The GitHub repository: `Toniio/DSAIReadable`. */
export const REPOSITORY = META.registry_source.repository

export const GITHUB_URL = `https://github.com/${REPOSITORY}`

/** A repository file on GitHub, at the release tag this build documents. */
export function sourceUrl(file: string): string {
  return `${GITHUB_URL}/blob/v${VERSION}/${file}`
}

/** The shadcn command that installs a registry item. */
export function installCommand(item: string): string {
  return `npx shadcn@latest add ${REPOSITORY}/${item}`
}
