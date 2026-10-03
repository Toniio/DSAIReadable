import {
  ArrowClockwiseIcon,
  FileDocIcon,
  FileIcon,
  FileImageIcon,
  FilePdfIcon,
  FileXlsIcon,
  FileZipIcon,
  XIcon,
} from "@phosphor-icons/react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import type { Args, Story } from "@/site/playground/types"

type UploadState = "idle" | "uploading" | "processing" | "error" | "done"

const STATES: UploadState[] = [
  "idle",
  "uploading",
  "processing",
  "error",
  "done",
]

/** What `AttachmentDescription` says in each state, as the spec asks. */
const DESCRIPTION: Record<UploadState, string> = {
  idle: "Waiting to upload",
  uploading: "Uploading, 40%",
  processing: "Reading the file…",
  error: "The upload failed. Try again.",
  done: "2.4 MB",
}

/** The file type icon, from the file name's extension. */
const ICONS: { pattern: RegExp; Icon: typeof FileIcon; name: string }[] = [
  { pattern: /\.pdf$/i, Icon: FilePdfIcon, name: "FilePdfIcon" },
  {
    pattern: /\.(png|jpe?g|gif|webp|avif)$/i,
    Icon: FileImageIcon,
    name: "FileImageIcon",
  },
  { pattern: /\.(xlsx?|csv)$/i, Icon: FileXlsIcon, name: "FileXlsIcon" },
  { pattern: /\.(docx?|odt)$/i, Icon: FileDocIcon, name: "FileDocIcon" },
  { pattern: /\.zip$/i, Icon: FileZipIcon, name: "FileZipIcon" },
]

function resolve(args: Args) {
  const state = STATES.includes(args.state as UploadState)
    ? (args.state as UploadState)
    : "done"
  const title = String(args.title).trim() || "report.pdf"
  const icon = ICONS.find((entry) => entry.pattern.test(title)) ?? {
    Icon: FileIcon,
    name: "FileIcon",
  }
  return {
    size: (["sm", "xs"].includes(String(args.size)) ? args.size : "default") as
      "default" | "sm" | "xs",
    orientation: (args.orientation === "vertical"
      ? "vertical"
      : "horizontal") as "horizontal" | "vertical",
    state,
    title,
    icon,
    busy: state === "uploading" || state === "processing",
    showActions: Boolean(args.showActions),
    showTrigger: Boolean(args.showTrigger),
  }
}

/** Text as a JSX child: braces and angle brackets go in an expression. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

/** Attachment: one file tile, its size, layout and upload state as controls. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "size",
      options: ["default", "sm", "xs"],
      default: "default",
    },
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    { kind: "select", name: "state", options: STATES, default: "done" },
    { kind: "text", name: "title", default: "report.pdf" },
    { kind: "boolean", name: "showActions", default: true },
    { kind: "boolean", name: "showTrigger", default: true },
  ],
  render: (args) => {
    const {
      size,
      orientation,
      state,
      title,
      icon,
      busy,
      showActions,
      showTrigger,
    } = resolve(args)
    const { Icon } = icon
    return (
      <Attachment size={size} orientation={orientation} state={state}>
        <AttachmentMedia>{busy ? <Spinner /> : <Icon />}</AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{title}</AttachmentTitle>
          <AttachmentDescription>{DESCRIPTION[state]}</AttachmentDescription>
        </AttachmentContent>
        {showActions ? (
          <AttachmentActions>
            {state === "error" ? (
              <AttachmentAction aria-label={`Retry upload of ${title}`}>
                <ArrowClockwiseIcon />
              </AttachmentAction>
            ) : null}
            <AttachmentAction aria-label={`Remove ${title}`}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        ) : null}
        {showTrigger ? (
          <AttachmentTrigger aria-label={`Open ${title}`} />
        ) : null}
      </Attachment>
    )
  },
  code: (args) => {
    const {
      size,
      orientation,
      state,
      title,
      icon,
      busy,
      showActions,
      showTrigger,
    } = resolve(args)
    const retry = showActions && state === "error"
    const icons = [
      ...(retry ? ["ArrowClockwiseIcon"] : []),
      ...(busy ? [] : [icon.name]),
      ...(showActions ? ["XIcon"] : []),
    ].sort()
    const parts = [
      "Attachment",
      ...(showActions ? ["AttachmentAction", "AttachmentActions"] : []),
      "AttachmentContent",
      "AttachmentDescription",
      "AttachmentMedia",
      "AttachmentTitle",
      ...(showTrigger ? ["AttachmentTrigger"] : []),
    ]
    const props = [
      size === "default" ? "" : ` size="${size}"`,
      orientation === "horizontal" ? "" : ` orientation="${orientation}"`,
      state === "done" ? "" : ` state="${state}"`,
    ].join("")
    const label = JSON.stringify
    const lines = [
      `    <Attachment${props}>`,
      `      <AttachmentMedia>`,
      busy ? `        <Spinner />` : `        <${icon.name} />`,
      `      </AttachmentMedia>`,
      `      <AttachmentContent>`,
      `        <AttachmentTitle>${text(title)}</AttachmentTitle>`,
      `        <AttachmentDescription>${DESCRIPTION[state]}</AttachmentDescription>`,
      `      </AttachmentContent>`,
      ...(showActions
        ? [
            `      <AttachmentActions>`,
            ...(retry
              ? [
                  `        <AttachmentAction aria-label=${label(`Retry upload of ${title}`)}>`,
                  `          <ArrowClockwiseIcon />`,
                  `        </AttachmentAction>`,
                ]
              : []),
            `        <AttachmentAction aria-label=${label(`Remove ${title}`)}>`,
            `          <XIcon />`,
            `        </AttachmentAction>`,
            `      </AttachmentActions>`,
          ]
        : []),
      ...(showTrigger
        ? [`      <AttachmentTrigger aria-label=${label(`Open ${title}`)} />`]
        : []),
      `    </Attachment>`,
    ]
    const imports = [
      icons.length
        ? `import { ${icons.join(", ")} } from "@phosphor-icons/react"\n\n`
        : "",
      `import {\n${parts.map((part) => `  ${part},`).join("\n")}\n} from "@/components/ui/attachment"`,
      busy ? `\nimport { Spinner } from "@/components/ui/spinner"` : "",
    ].join("")
    return `${imports}

export function Example() {
  return (
${lines.join("\n")}
  )
}
`
  },
}

export default story
