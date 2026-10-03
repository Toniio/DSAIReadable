import type { ReactNode } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { REPOSITORY, installCommand } from "@/site/lib/site"
import type { Install } from "@/site/overview/data"
import { CodeBlock, CommandLine } from "@/site/ui/code-block"
import { LINK } from "@/site/ui/link"

/** One numbered step: what it does, then its command. */
function Step({
  index,
  title,
  children,
}: {
  index: number
  title: ReactNode
  children: ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
      >
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm leading-relaxed">{title}</p>
        {children}
      </div>
    </li>
  )
}

function Names({ label, names }: { label: string; names: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ul className="flex flex-wrap gap-1">
        {names.map((name) => (
          <li key={name}>
            <Badge variant="secondary" className="font-mono">
              {name}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The four ways in: the registry, the MCP server, the skills, the lint rules. */
export function GetStarted({ install }: { install: Install }) {
  return (
    <Tabs defaultValue="registry" className="gap-4">
      <TabsList
        variant="line"
        className="max-w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto"
      >
        <TabsTrigger value="registry">Components</TabsTrigger>
        <TabsTrigger value="mcp">MCP server</TabsTrigger>
        <TabsTrigger value="skills">Agent skills</TabsTrigger>
        <TabsTrigger value="eslint">ESLint plugin</TabsTrigger>
      </TabsList>

      <TabsContent value="registry" className="flex flex-col gap-4">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The shadcn registry copies the source into your project: no package to
          install for the components. It needs a React and Tailwind CSS v4
          project.
        </p>
        <ol className="flex flex-col gap-4">
          <Step index={1} title="Set up shadcn/ui in the project.">
            <CommandLine
              command="npx shadcn@latest init"
              label="Copy the init command"
            />
          </Step>
          <Step
            index={2}
            title={
              <>
                Add a component. The base item (tokens, dark mode, fonts,{" "}
                <code className="font-mono text-xs">cn()</code>, focus) comes
                along with it.
              </>
            }
          >
            <CommandLine
              command={installCommand("button")}
              label="Copy the Button install command"
            />
          </Step>
          <Step
            index={3}
            title="Add the rules your agents read, for Cursor, Claude Code and Copilot."
          >
            <CommandLine
              command={installCommand("conventions")}
              label="Copy the conventions install command"
            />
          </Step>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Always the full address,{" "}
          <code className="font-mono text-xs">{REPOSITORY}/&lt;item&gt;</code>:
          a bare name installs the official shadcn/ui component instead. Each{" "}
          <Link href="/components/" className={LINK}>
            component page
          </Link>{" "}
          has its own command.
        </p>
      </TabsContent>

      <TabsContent value="mcp" className="flex flex-col gap-4">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The server runs on your machine over stdio, with{" "}
          <code className="font-mono text-xs">npx</code>: nothing is hosted.
          {install.mcpNode
            ? ` It needs Node.js ${install.mcpNode} or later.`
            : ""}
        </p>
        <ol className="flex flex-col gap-4">
          <Step index={1} title="Claude Code:">
            <CommandLine
              command={`claude mcp add ${install.registry} -- npx -y ${install.mcpPackage}`}
              label="Copy the Claude Code command"
            />
          </Step>
          <Step
            index={2}
            title={
              <>
                Claude Desktop, VS Code or Copilot: add the server to the
                client&apos;s MCP configuration.
              </>
            }
          >
            <CodeBlock
              code={install.mcpConfig}
              language="json"
              title="MCP configuration"
            />
          </Step>
        </ol>
        <Names label={`${install.tools.length} tools`} names={install.tools} />
      </TabsContent>

      <TabsContent value="skills" className="flex flex-col gap-4">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The skills build a screen MCP-first and review it before handing it
          back. They are pinned to this release, so the tools they name always
          exist.
        </p>
        <ol className="flex flex-col gap-4">
          <Step
            index={1}
            title="Any agent that reads skills from a repository:"
          >
            <CommandLine
              command={install.skillsAdd}
              label="Copy the skills command"
            />
          </Step>
          <Step
            index={2}
            title="Claude Code: the skills and the MCP server in one plugin."
          >
            <div className="flex flex-col gap-2">
              <CommandLine
                command={install.marketplaceAdd}
                label="Copy the marketplace command"
              />
              <CommandLine
                command={install.pluginInstall}
                label="Copy the plugin install command"
              />
            </div>
          </Step>
        </ol>
        <Names
          label={`${install.skills.length} skills`}
          names={install.skills}
        />
      </TabsContent>

      <TabsContent value="eslint" className="flex flex-col gap-4">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The design system&apos;s rules in your own lint, so a violation shows
          where the code is written, not in review. The MCP server runs the same
          rules.
        </p>
        <ol className="flex flex-col gap-4">
          <Step index={1} title="Install the plugin:">
            <CommandLine
              command={`npm install -D ${install.eslintPackage}`}
              label="Copy the ESLint plugin install command"
            />
          </Step>
          <Step index={2} title="Turn on the recommended config:">
            <CodeBlock
              code={install.eslintConfig}
              language="js"
              title="eslint.config.mjs"
            />
          </Step>
        </ol>
        <Names
          label={`${install.eslintRules.length} rules`}
          names={install.eslintRules}
        />
      </TabsContent>
    </Tabs>
  )
}
