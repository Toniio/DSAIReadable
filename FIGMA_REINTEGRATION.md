# Reintegrating the Figma layer

> **Status**: Figma layer removed from the repository on **2026-09-17**.
> This document is the full spec for rebuilding it.
> Why it was removed: to get a **code-first** source-of-truth design system that
> an AI design agent can consume without depending on an external tool.

---

## 0. Backup archive

At the time, the repository **was not under git**. An archive of every file
deleted or modified was created before the operation:

```
~/.copilot/session-state/73c95c37-f3bc-49dc-b749-63a3e92eb8fa/files/figma-archive/figma-removed-2026-09-17.tar.gz
```

It holds the original state of:
`components/ui/*.figma.tsx`, `scripts/figma/`, `scripts/figma-push-variables.py`,
`scripts/tokens-diff.ts`, `figma.config.json`, `tsconfig.figma.json`,
`types/figma-code-connect.d.ts`, `design-system.index.json`, `design-system.schema.json`,
`mcp-server/src/**`, `README.md`, `PROJECT_STRUCTURE.md`, `specs/`.

> ⚠️ The archive also holds `packages/make-kit/**`. That package has since been **deleted from the repository**:
> distribution goes through the shadcn registry. Do not restore it — see the obsolete section at the end of §7.

**Before any reintegration, extract this archive into a temporary folder to
recover the Code Connect prop mappings** (not reproduced in full below).

---

## 1. What existed — overview

The Figma layer covered **five separate responsibilities**. They are independent:
any one of them can be reintegrated without the others.

| #   | Building block                                               | Direction    | Files                                                                                  |
| --- | ------------------------------------------------------------ | ------------ | -------------------------------------------------------------------------------------- |
| 1   | **Code Connect** — React component ↔ Figma component mapping | code → Figma | `components/ui/*.figma.tsx` (54), `figma.config.json`, `types/figma-code-connect.d.ts` |
| 2   | **Token push** — DTCG tokens → Figma Variables               | code → Figma | `scripts/figma-push-variables.py`                                                      |
| 3   | **Token diff** — code ↔ Figma drift detection                | Figma → code | `scripts/tokens-diff.ts`                                                               |
| 4   | **Figma component creation** through the Plugin API          | code → Figma | `scripts/figma/*.ts` + `*.cjs` (17)                                                    |
| 5   | **Inventory metadata** — `figma_node_id`, `figma_file_key`   | descriptive  | `design-system.index.json`, `specs/components/*.md`, MCP context                       |

### Coordinates of the source Figma file

The real values are not published: the file and its registry belong to a private
Figma workspace. Look them up in Figma (_Share → Copy link_ for the key; the
organization settings for the registry) and never commit them.

| Key                  | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| `figma_file_key`     | `<FIGMA_FILE_KEY>`                                             |
| `figma_site`         | `https://www.figma.com/design/<FIGMA_FILE_KEY>/DSAIReadable`   |
| `last_publish`       | `2025-07-08T12:00:00Z`                                         |
| Private npm registry | `https://registry.figma.com/npm/<FIGMA_REGISTRY_ID>/registry/` |

### Required environment variables

| Variable          | Used by                                     | Scopes / role                                                                                       |
| ----------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `FIGMA_FILE_KEY`  | `tokens-diff.ts`, `figma-push-variables.py` | the file key                                                                                        |
| `FIGMA_TOKEN`     | same                                        | a PAT with `file_content:read`, `library_content:read`, `file_variables:write`                      |
| `FIGMA_NPM_TOKEN` | `.npmrc`                                    | ~~auth for the `registry.figma.com` registry~~ — **obsolete**: no npm package is published any more |

---

## 2. `figma_node_id` mapping — restore as is

The full reference table at the time of the removal. The specs' `figma_node_id`
rows were **kept but emptied**: repopulating them with these values is enough.

| Component      | figma_node_id | code_path                         | Had a Code Connect |
| -------------- | ------------- | --------------------------------- | ------------------ |
| Accordion      | 176:2492      | components/ui/accordion.tsx       | yes                |
| Alert          | 176:2331      | components/ui/alert.tsx           | yes                |
| AlertDialog    | 176:2678      | components/ui/alert-dialog.tsx    | yes                |
| AspectRatio    | —             | components/ui/aspect-ratio.tsx    | —                  |
| Avatar         | 176:2401      | components/ui/avatar.tsx          | yes                |
| Badge          | 176:2394      | components/ui/badge.tsx           | yes                |
| Breadcrumb     | 176:2474      | components/ui/breadcrumb.tsx      | yes                |
| Button         | 176:2322      | components/ui/button.tsx          | yes                |
| ButtonGroup    | 176:2593      | components/ui/button-group.tsx    | yes                |
| Calendar       | 176:2812      | components/ui/calendar.tsx        | yes                |
| Card           | 176:2356      | components/ui/card.tsx            | yes                |
| Carousel       | 176:2773      | components/ui/carousel.tsx        | yes                |
| Chart          | 176:2957      | components/ui/chart.tsx           | yes                |
| Checkbox       | 176:2273      | components/ui/checkbox.tsx        | yes                |
| Collapsible    | 176:2662      | components/ui/collapsible.tsx     | yes                |
| Combobox       | 176:2763      | components/ui/combobox.tsx        | yes                |
| Command        | 176:2719      | components/ui/command.tsx         | yes                |
| ContextMenu    | 176:2702      | components/ui/context-menu.tsx    | yes                |
| Dialog         | 176:2510      | components/ui/dialog.tsx          | yes                |
| Direction      | —             | components/ui/direction.tsx       | —                  |
| Drawer         | 176:2701      | components/ui/drawer.tsx          | yes                |
| DropdownMenu   | 176:2533      | components/ui/dropdown-menu.tsx   | yes                |
| Empty          | 176:2571      | components/ui/empty.tsx           | yes                |
| Field          | 176:2381      | components/ui/field.tsx           | yes                |
| Heading        | 176:2549      | components/ui/heading.tsx         | yes                |
| HoverCard      | 176:2689      | components/ui/hover-card.tsx      | yes                |
| Illustration   | —             | components/ui/illustration.tsx    | —                  |
| Input          | 176:2262      | components/ui/input.tsx           | yes                |
| InputGroup     | 176:2618      | components/ui/input-group.tsx     | yes                |
| InputOtp       | 176:2619      | components/ui/input-otp.tsx       | yes                |
| Item           | 176:2811      | components/ui/item.tsx            | yes                |
| Kbd            | 176:2554      | components/ui/kbd.tsx             | yes                |
| Label          | 176:2244      | components/ui/label.tsx           | yes                |
| Logo           | —             | components/ui/logo.tsx            | —                  |
| Menubar        | 176:2712      | components/ui/menubar.tsx         | yes                |
| NativeSelect   | 176:2634      | components/ui/native-select.tsx   | yes                |
| NavigationMenu | 176:2738      | components/ui/navigation-menu.tsx | yes                |
| Pagination     | 176:2493      | components/ui/pagination.tsx      | yes                |
| PasswordInput  | —             | components/ui/password-input.tsx  | —                  |
| Popover        | 176:2687      | components/ui/popover.tsx         | yes                |
| Progress       | 176:2507      | components/ui/progress.tsx        | yes                |
| RadioGroup     | 176:2430      | components/ui/radio-group.tsx     | yes                |
| Resizable      | 176:2677      | components/ui/resizable.tsx       | yes                |
| ScrollArea     | 176:2772      | components/ui/scroll-area.tsx     | yes                |
| Select         | 176:2456      | components/ui/select.tsx          | yes                |
| Separator      | 176:2250      | components/ui/separator.tsx       | yes                |
| Sheet          | 176:2532      | components/ui/sheet.tsx           | yes                |
| Sidebar        | 176:2935      | components/ui/sidebar.tsx         | yes                |
| Skeleton       | 176:2553      | components/ui/skeleton.tsx        | yes                |
| Slider         | 176:2440      | components/ui/slider.tsx          | yes                |
| Sonner         | 176:2956      | components/ui/sonner.tsx          | yes                |
| Spinner        | 176:2251      | components/ui/spinner.tsx         | yes                |
| Switch         | 176:2410      | components/ui/switch.tsx          | yes                |
| Table          | 176:2570      | components/ui/table.tsx           | yes                |
| Tabs           | 176:2473      | components/ui/tabs.tsx            | yes                |
| Textarea       | 176:2439      | components/ui/textarea.tsx        | yes                |
| Toggle         | 176:2423      | components/ui/toggle.tsx          | yes                |
| ToggleGroup    | 176:2651      | components/ui/toggle-group.tsx    | yes                |
| Tooltip        | 176:2520      | components/ui/tooltip.tsx         | yes                |

> Every node-id belongs to the `176:*` page of the source file. `AspectRatio`,
> `Direction`, `Illustration`, `Logo` and `PasswordInput` **never** had a Figma counterpart.

---

## 3. Building block 1 — Figma Code Connect

### Removed npm dependencies

```jsonc
// package.json → devDependencies
"@figma/code-connect": "^1.4.4",
"@figma/plugin-typings": "^1.138.0"
```

### `figma.config.json` (to recreate at the root)

```json
{
  "codeConnect": {
    "parser": "react",
    "include": ["components/ui/**/*.tsx"],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### `types/figma-code-connect.d.ts` (to recreate)

A type augmentation, needed because the `instructions` key — used to give LLMs
usage context through Dev Mode — is not declared by the upstream package.

```ts
import "@figma/code-connect"

declare module "@figma/code-connect/dist/connect/api" {
  interface FigmaConnectMeta<
    PropsT = {},
    ResolvedPropsT = {},
    ExampleFnReturnT = unknown,
    ExtraExampleT = never,
  > {
    instructions?: string
  }
}
```

### `tsconfig.json` — path mapping to add back

```jsonc
"paths": {
  "@figma/code-connect/dist/connect/api": [
    "./node_modules/@figma/code-connect/dist/connect/api"
  ]
}
```

### `eslint.config.mjs` — override to add back

```js
{
  // Declaration merging with @figma/code-connect requires type parameters
  // that are strictly identical to upstream, default values included.
  // Replacing `{}` with `object` breaks the merge, so the rule cannot apply.
  files: ["types/figma-code-connect.d.ts"],
  rules: { "@typescript-eslint/no-empty-object-type": "off" },
}
```

### Anatomy of a `.figma.tsx` file (reference: `button.figma.tsx`)

```tsx
import figma from "@figma/code-connect"
import { Button } from "@/components/ui/button"

figma.connect(
  Button,
  "https://www.figma.com/design/<FILE_KEY>?node-id=176:2322",
  {
    links: [
      {
        name: "Source",
        url: "https://github.com/Toniio/DSAIReadable/blob/main/components/ui/button.tsx",
      },
    ],
    props: {
      variant: figma.enum("Variant", {
        Default: "default",
        Outline: "outline",
        Secondary: "secondary",
        Ghost: "ghost",
        Destructive: "destructive",
        Link: "link",
      }),
      size: figma.enum("Size", {
        Default: "default",
        Sm: "sm",
        Lg: "lg",
        Icon: "icon",
      }),
      label: figma.string("label"),
    },
    example: ({ variant, size, label }) => (
      <Button variant={variant} size={size}>
        {label}
      </Button>
    ),
    instructions: `
    Button is the primary action trigger. Use variant="default" for primary actions,
    "outline" for secondary actions, "destructive" for irreversible actions, and "ghost"
    or "link" for low-emphasis navigation. Always provide an aria-label for icon-only sizes.
  `,
  }
)
```

**Invariant rules observed across the 54 files:**

- one `figma.connect()` per root component; sub-components (such as `CardHeader`)
  get their own `figma.connect()` calls in the same file;
- `figma.enum()` maps a Figma variant property (key = the Figma label,
  **capitalized**) to the React prop value (**kebab / lowercase**);
- `figma.string()` / `figma.boolean()` / `figma.children()` for content;
- `links[]` always points to the source file on GitHub;
- `instructions` is English text that says _when_ to use the component — that
  information **already exists** in `specs/components/<Name>.md` (the
  `## Role`, `## Usage` and `## Constraints` sections) and can be regenerated
  from it.

> **The exact enum mappings are not reproduced here** (54 files).
> Recover them from the §0 archive, or regenerate them from the components' `cva` blocks.

### npm scripts to restore

```jsonc
"typecheck:figma": "tsc --noEmit -p tsconfig.figma.json",
"typecheck:all": "npm run typecheck && npm run typecheck:scripts && npm run typecheck:figma && npm run typecheck:mcp"
```

Publishing: `npx figma connect publish`.

---

## 4. Building block 2 — Pushing tokens to Figma Variables

File: `scripts/figma-push-variables.py` (~19 KB, Python 3, standard library only).

### Behavior

1. reads `tokens/primitive.json`, `tokens/semantic.json`, `tokens/component.json` (DTCG format);
2. creates or updates **3** Figma Variables **collections**:
   - `Primitive` — a collection **hidden** from publishing (`hiddenFromPublishing: true`),
   - `Semantic` — **2 modes**: `light` + `dark`,
   - `Component` — a single mode;
3. converts `oklch(...)` → sRGB `{r,g,b,a}` (the Figma API does not accept oklch);
4. `POST https://api.figma.com/v1/files/{FIGMA_FILE_KEY}/variables` with the
   header `X-Figma-Token: $FIGMA_TOKEN`;
5. translates the local dot notation (`color.background.default`) into Figma's
   slash notation (`color/background/default`).

### npm scripts to restore

```jsonc
"figma:push": "python3 scripts/figma-push-variables.py",
"figma:push:dry": "python3 scripts/figma-push-variables.py --dry-run"
```

---

## 5. Building block 3 — Code ↔ Figma token diff

File: `scripts/tokens-diff.ts` (~14 KB, tsx). **It was wired into `tokens-validate`,
and therefore into CI.**

### Behavior

- `GET https://api.figma.com/v1/files/{FIGMA_FILE_KEY}/variables/local`;
- when `FIGMA_FILE_KEY` or `FIGMA_TOKEN` is missing → **exit 0 with a warning** (not blocking locally);
- compares three sets and exits with an error on `valueMismatch`:
  - `onlyInLocal` (warning), `onlyInFigma` (warning), `valueMismatch` (**exit 1**).

### Normalization rules to reproduce exactly

| Case              | Rule                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Name separator    | Figma `/` ↔ code `.`                                                                                    |
| Colors            | Figma returns `{r,g,b,a}` floats → convert to `#hex`, case-insensitive comparison                       |
| Variable alias    | `{type: "VARIABLE_ALIAS"}` → **ignore** (a reference to another variable)                               |
| Numbers           | absolute tolerance of **0.02** (Figma's floating-point precision)                                       |
| `letter-spacing`  | Figma cannot represent `em` → stores `0`; tolerance of **1** on these keys                              |
| Shadows / effects | **excluded** from the comparison (Figma stores them as effect objects, not CSS strings)                 |
| Compound words    | Figma uses no hyphen → the `FIGMA_NAME_NORMALIZATION` table                                             |
| Renames           | a two-way `CODE_TO_FIGMA_ALIASES` / `FIGMA_TO_CODE_ALIASES` table, while Figma catches up with the code |

### npm scripts to restore

```jsonc
"tokens:diff": "tsx scripts/tokens-diff.ts",
"tokens-validate": "npm run tokens:check && npm run tokens:lint-naming && npm run tokens:lint-values && npm run tokens:lint-bridge && npm run tokens:diff"
```

---

## 6. Building block 4 — Creating the Figma components programmatically

Folder: `scripts/figma/` (17 files). It drove the **Figma Plugin API** from VS Code
through the `figma-console-mcp` MCP server.

| File                                              | Role                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `_helpers.ts`                                     | shared primitives: frame creation, variable binding, auto-layout                            |
| `01-label.ts` → `10-finalize.ts`                  | one component per script, **in dependency order** (Label before Field, Input before Field…) |
| `run-all.ts`                                      | sequential orchestrator                                                                     |
| `all-components.js` (177 KB)                      | a generated dump of every component                                                         |
| `get-node-ids.js`                                 | extracts the node-ids after creation → feeds `design-system.index.json`                     |
| `mcp-client.cjs`, `run-query.cjs`, `sync-all.cjs` | low-level MCP client + synchronization                                                      |

### `tsconfig.figma.json` (to recreate)

A separate TS project: the Figma Plugin sandbox has **no** Node.js types, hence
`types: ["@figma/plugin-typings"]` and `lib: ["ES2020"]`, kept apart.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["@figma/plugin-typings"],
    "lib": ["ES2020"]
  },
  "include": ["scripts/figma/**/*.ts"],
  "exclude": []
}
```

The root `tsconfig.json` must then **exclude** `scripts/figma/**`.

### MCP configuration (`.vscode/mcp.json`, not in the repository today)

The `figma-console-mcp` server must be registered again. The golden rule back
then: **never edit the source Figma kit by hand** — everything goes through these scripts.

---

## 7. Building block 5 — Inventory metadata

### `design-system.index.json`

```jsonc
{
  "library": {
    "figma_file_key": "<FIGMA_FILE_KEY>",
    "figma_site": "https://www.figma.com/design/<FIGMA_FILE_KEY>/DSAIReadable",
    "last_publish": "2025-07-08T12:00:00Z",
  },
  "inventory": [
    {
      "name": "Button",
      "figma_node_id": "176:2322",
      "code_path": "components/ui/button.tsx",
      "status": "stable",
    },
  ],
  "glossary": {
    "figma_node_id": "The Figma node identifier for a component instance. Used by Code Connect to map Figma instances to code. Null until Figma components are published in the library.",
  },
}
```

### `design-system.schema.json`

- `library`: the object was removed along with `last_publish` (P3-09: only the
  Figma library filled it in). Add it back at the root (`required` and
  `properties`), with `required: ["last_publish", "figma_file_key"]` and the
  `last_publish`, `figma_file_key` and `figma_site` properties (strings,
  `additionalProperties: false`);
- `inventory.items.required`: add `"figma_node_id"` back;
- `inventory.items.properties.figma_node_id`: `{ "type": ["string","null"] }`.

### `specs/components/*.md` — **kept, emptied**

The `| figma_node_id | |` row is **still present in all 59 specs**, with an
empty value. It is the intended anchor: repopulate it from the §2 table.
`mcp-server/src/context/generate.ts` no longer reads it; restoring
`figma_node_id: get("figma_node_id") || null` (below) is what brings it back to
the MCP context.

Two sections were also renamed and one was deleted:

| File                                | Before                            | After         |
| ----------------------------------- | --------------------------------- | ------------- |
| `specs/components/Heading.md`       | A "Figma variants" section        | `## Variants` |
| `specs/components/PasswordInput.md` | A "Figma variants" section        | `## Variants` |
| `specs/components/Illustration.md`  | A "Figma notes" section (2 lines) | deleted       |

### `mcp-server/src/context/generate.ts`

To restore:

- the type `inventory[].figma_node_id: string | null`;
- `components.json`: the `figma_node_id` and
  `has_code_connect: existsSync(code_path.replace(/\.tsx$/, ".figma.tsx"))` fields;
- the `components/ui/` scan filter: `!f.endsWith(".figma.tsx")`;
- `component-specs.json`: `figma_node_id: get("figma_node_id") || null`;
- `ds-metadata.json`: a `figma: { file_key, site, last_publish }` block.

### `mcp-server/src/tools/ds-core.ts` and `admin.ts`

To restore: `figma_coverage` and `code_connect_coverage` in the stats, and the
`figma: { file_key, site }` block in `ds_overview`.

### `mcp-server/src/index.ts`

```ts
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.figma.com", // required for Figma Make in HTTP mode
  "https://figma.com",
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]
```

And the server description ended with `… tokens, Figma-synced`.

### ~~`packages/make-kit`~~ — obsolete section

The `make-kit` package was **deleted from the repository** (decision of 2026-09-17): it
was the delivery vehicle for Figma Make, and its npm scope `@DSAIReadable` — npm
forbids capitals — could not have been published anyway. The single distribution
channel is now the **shadcn registry** carried by this repository.

Nothing to restore here. For the record, the Figma elements it carried were:
`publishConfig.registry` pointing to `registry.figma.com`, a `## Figma library`
section in its README, a `> Figma library: …` header in `guidelines.md`, a copy
of `design-system.index.json` and an `.npmrc` redirecting the scope to the Figma
registry.

---

## 8. Suggested reintegration procedure

The building blocks are independent; doing them in this order keeps the risk down.

1. **Metadata first** (building block 5) — repopulate `figma_node_id` in the
   specs from §2, then `design-system.index.json` + `design-system.schema.json`,
   then restore the fields in `generate.ts` / `ds-core.ts` / `admin.ts`.
   → `npm run generate-context && npm run typecheck:mcp`
2. **Tokens going up** (building block 2) — `figma-push-variables.py`: the source
   of truth flows out of the code, so it carries no risk for the design system.
   → `npm run figma:push:dry`
3. **Tokens coming down** (building block 3) — `tokens-diff.ts`, then wire it back
   into `tokens-validate` **only once it passes**, otherwise CI breaks.
4. **Code Connect** (building block 1) — reinstall `@figma/code-connect`, recreate
   `figma.config.json` + `types/figma-code-connect.d.ts` + the tsconfig / eslint
   overrides, then restore the `.figma.tsx` files from the §0 archive.
   → `npm run typecheck:figma && npx figma connect publish`
5. **Figma component generation** (building block 4) — the heaviest; only redo
   it if the Figma kit has to be regenerated from scratch.

### Verification checklist

```bash
npm run typecheck:all
npm run tokens-validate
npm run generate-context
npm run test
```

---

## 9. What matters for an "AI-driven design system"

The Figma layer carried two things of a different nature:

- **synchronization plumbing** (building blocks 1–4) — useless to an AI agent that
  generates code, since it reads the specs and the tokens directly;
- **design semantics** (the `instructions` field of the Code Connect files, the
  "Figma variants" tables) — **valuable** to an agent.

Those semantics were not lost: they overlap with `specs/components/*.md`
(`## Role`, `## Usage`, `## Constraints`, `## Props / API`) and with
`mcp-server/context/component-specs.json`. **If building block 1 is reintegrated,
generate the `instructions` from the specs instead of maintaining them twice.**
