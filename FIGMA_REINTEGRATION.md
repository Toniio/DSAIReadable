# Building the Figma library

> **Status**: this repository has no Figma layer. The one it had was removed on
> **2026-09-17** to keep the design system code-first, and the Figma file it
> pointed to no longer matches the code.
>
> **This document** is the brief for rebuilding the library in Figma from the
> code, with the Figma agent. It is written for **v0.5.0**: its counts and its
> links are that release's. [`llms.txt`](./llms.txt) lists the links of the
> current release.

The code is the source of truth, and it stays so. The Figma library is a
rendering of it: every variable, style and component below is read from a file
of this repository, and nothing is designed in Figma first.

---

## 1. What to give the agent

Two links name the design system:

| Link                                         | What it holds                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `https://github.com/Toniio/DSAIReadable.git` | The source: tokens, components, specs. **It decides** whenever the two disagree              |
| `https://toniio.github.io/DSAIReadable/`     | The documentation site, built from the release: every component rendered, in the four themes |

The Figma agent works inside a Figma Design file. What it takes as context,
according to Figma's Help Center on 2026-11-21
([Work with the Figma agent in design files](https://help.figma.com/hc/en-us/articles/37998629035799-Work-with-the-Figma-agent-in-design-files)):
attached text and code files, images, Figma design URLs, the libraries
connected to the file, MCP connectors and skills, and web search on a paid
plan. Importing a GitHub repository as a library's code source is a closed
beta. A link pasted in a prompt is therefore read only as far as web search
reaches it, and a repository of this size is not read whole.

So give the links **and attach the files each phase reads**. They are small:

| Phase                     | Attach                                                                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every phase               | This document                                                                                                                                                                          |
| Variables (§ 4)           | `tokens/primitive.json`, `tokens/semantic.json`, `tokens/semantic.dark.json`, `tokens/semantic.nova.json`, `tokens/semantic.nova.dark.json`, `tokens/component.json` (230 KB together) |
| Styles (§ 5)              | `tokens/primitive.json`, `specs/foundations/typography.md`, `specs/foundations/elevation.md`                                                                                           |
| Components (§ 7), a batch | The `specs/components/<Component>.md` of the batch, `specs/foundations/radius.md`, `specs/foundations/focus.md`, and a screenshot of each component's site page                        |

The site keeps its brand switch (lyra, nova) and its theme switch (Auto, Light,
Dark) in the browser, not in the URL: a page fetched by its link is lyra, in the
reader's color scheme. A screenshot carries the theme; a link does not.

---

## 2. Sources of truth

Every link below points to the release tag. `main` can be ahead of it.

| What                                    | File                                                                                                                                  | On the site                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Every entry point, one line each        | [`llms.txt`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/llms.txt)                                                   | `/`                                       |
| Raw values, with a `hex` for each color | [`tokens/primitive.json`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/tokens/primitive.json)                         | `/foundations/color/`                     |
| The themes and their order              | [`tokens/tokens.resolver.json`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/tokens/tokens.resolver.json)             | `/foundations/layers/`                    |
| Every token, resolved in each theme     | [`tokens.manifest.json`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/tokens.manifest.json) (333 KB)                  | `/foundations/tokens/`                    |
| The same, as a table                    | [`specs/tokens/token-reference.md`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/specs/tokens/token-reference.md)     | `/foundations/tokens/`                    |
| The same, as CSS, one block per theme   | [`tokens.css`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/tokens.css) (48 KB)                                       | —                                         |
| The 67 components and their status      | [`design-system.index.json`](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/design-system.index.json)                   | `/components/`                            |
| One component: the behavioral contract  | `specs/components/<Component>.md` ([Button](https://raw.githubusercontent.com/Toniio/DSAIReadable/v0.5.0/specs/components/Button.md)) | `/components/<component>/`, in kebab case |
| One component: its classes              | `components/ui/<component>.tsx`                                                                                                       | `/preview/components/<component>/`        |
| The 13 foundations                      | `specs/foundations/<foundation>.md`                                                                                                   | `/foundations/<foundation>/`              |
| The 12 page patterns                    | `specs/patterns/<pattern>.md`                                                                                                         | `/patterns/<pattern>/`                    |

A component spec has 13 sections. Four of them are generated from the code, so
they say what the component draws: **Anatomy** (its `data-slot` parts),
**Tokens** (each class and the token it reads), **Variants** (the axes and
their values) and **States** (the classes of each state).

---

## 3. Rules of the build

1. **The repository decides.** When the site, a screenshot or a memory of
   shadcn/ui disagrees with a file of the release, the file is right.
2. **Nothing is invented.** No token, variant, value, prop or state that a
   source file does not hold. What Figma cannot express is reported (§ 9), not
   approximated.
3. **Names are the code's, verbatim.** A variable is its token path, a
   component its React export, a property its prop, a value its union member:
   `variant`, `icon-sm`, `default`, in lower case as the code writes them. No
   mapping table then stands between a Figma instance and the code.
4. **Every value is bound.** A fill, a stroke, a radius, a gap, a padding, a
   size, a typeface: each reads a Semantic or a Component variable. A component
   never reads a Primitive variable, and never holds a raw value.
5. **Four themes, one component.** A component is drawn once and renders
   lyra light, lyra dark, nova light and nova dark through the mode of the
   frame that holds it.
6. **The accessibility target is WCAG 2.2 AA.** The token pairs meet it in the
   four themes; a color changed by hand breaks that guarantee.

---

## 4. Variables

Three collections mirror the three token tiers. Each variable is named by its
full token path, dots turned into slashes: `color.action.background.default`
is `color/action/background/default`. No path is both a variable and a group.

| Collection  | Source                  | Modes                                      | Variables                                                     | Publishing |
| ----------- | ----------------------- | ------------------------------------------ | ------------------------------------------------------------- | ---------- |
| `Primitive` | `tokens/primitive.json` | one                                        | 263, holding raw values                                       | **hidden** |
| `Semantic`  | `tokens/semantic*.json` | `light`, `dark`, `nova-light`, `nova-dark` | 207, aliases of Primitive variables, with one exception below | published  |
| `Component` | `tokens/component.json` | one                                        | 33, each an alias of a Semantic variable                      | published  |

The `Component` collection needs no mode of its own: an alias resolves in the
mode its target has on the frame.

One Semantic variable holds a raw value in two modes:
`typography/size-line-height/description` is `19.5` in `light` and `dark`, and
an alias of `primitive/typography/size-line-height/sm` in `nova-light` and
`nova-dark`. In lyra the token references the ratio
`primitive.typography.line-height.relaxed` (1.625), a variable that stays a
ratio, while Figma binds a line height in pixels: 12 × 1.625. It is the only
exception, and every other Semantic variable is an alias in its four modes.

### Themes

A theme is a brand in a color scheme, and the `Semantic` collection has one
mode per context of `tokens/tokens.resolver.json`. A theme file holds only the
tokens it changes, so a mode with no entry for a token falls back:

| Mode         | Brand and scheme | Reads, last one wins                                        | Key in `tokens.manifest.json` | When the key is absent |
| ------------ | ---------------- | ----------------------------------------------------------- | ----------------------------- | ---------------------- |
| `light`      | lyra, light      | `semantic.json`                                             | `light`                       | —                      |
| `dark`       | lyra, dark       | then `semantic.dark.json` (59 tokens)                       | `dark`                        | `light`                |
| `nova-light` | nova, light      | `semantic.json`, then `semantic.nova.json` (60 tokens)      | `nova`                        | `light`                |
| `nova-dark`  | nova, dark       | dark, then nova, then `semantic.nova.dark.json` (41 tokens) | `novaDark`                    | `dark`, then `light`   |

In `tokens.manifest.json`, `reference` is the alias to write in each mode and
`value` is what it resolves to. `tokens.css` says the same in four blocks:
`:root`, `.dark`, `.nova`, and `.nova.dark`.

A brand moves colors, typefaces, radii and text sizes, and nothing else.

### From a token to a variable

| DTCG `$type`                                           | Figma variable | Conversion                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color` (128 primitives)                               | Color          | The `hex` of the `$value`, with its `alpha` when it has one (`white-alpha`, `ink-alpha`). The OKLCH components are the source and the `hex` its sRGB rendering: never convert them by hand                                                                                                                              |
| `dimension` in `rem`                                   | Number         | × 16, in pixels: `0.625rem` is `10`                                                                                                                                                                                                                                                                                     |
| `dimension` in `px`                                    | Number         | As written. `radius.full` is `9999`                                                                                                                                                                                                                                                                                     |
| `dimension` in `em`                                    | Number         | The 5 letter spacings, × 100, as a percentage: `-0.025em` is `-2.5`. Set in the text styles, not bound: Figma binds letter spacing in pixels                                                                                                                                                                            |
| `number`, `typography.line-height.*`                   | Number         | The ratio, as written. Applied in a text style as a percentage, not bound                                                                                                                                                                                                                                               |
| `number`, `typography.size-line-height.*`              | Number         | In pixels: the ratio × the `typography.size.*` of the same name in the same mode, to the half pixel. `ui` is `16` in lyra (12 × 1.33334) and `20` in nova (14 × 1.42858). Figma binds line height in pixels. A primitive holds the number, and a Semantic variable aliases it, except `description` in lyra (see above) |
| `number`, `opacity.*`                                  | Number         | × 100: `0.5` is `50`                                                                                                                                                                                                                                                                                                    |
| `number`, `zindex.*`                                   | Number         | As written, with no scope: Figma has no stacking order to bind                                                                                                                                                                                                                                                          |
| `fontWeight`                                           | Number         | As written: `400`, `500`, `600`, `700`                                                                                                                                                                                                                                                                                  |
| `fontFamily`                                           | String         | The first family of the list: `JetBrains Mono, monospace` is `JetBrains Mono`                                                                                                                                                                                                                                           |
| `shadow` (14 primitives, 7 semantic)                   | none           | An effect style (§ 5)                                                                                                                                                                                                                                                                                                   |
| `duration`, `cubicBezier` (10 primitives, 10 semantic) | none           | No variable: listed as text on the Motion page                                                                                                                                                                                                                                                                          |

On each variable:

- **Description**: the token's `$description`. A token whose
  `$extensions.status` is `reserved` starts its description with `Reserved:`;
  it is a valid decision that no component reads yet.
- **Code syntax, Web**: `var(<cssVar>)`, the `cssVar` of `tokens.manifest.json`
  (`var(--color-action-background-default)`), on Semantic and Component
  variables. Primitive variables get none: they are private.
- **Scope**: what the group draws. `color/background`, `color/overlay`,
  `color/action` and `color/feedback` fill frames and shapes; `color/text` and
  `color/icon` fill text and icons; `color/border` draws strokes; `radius`
  rounds corners; `space` sets gaps, paddings, widths and heights; `opacity`
  sets layer opacity; `border-width` sets stroke weight.
- **Deprecated tokens are not created**: `opacity.placeholder` and
  `opacity.overlay`, the two tokens that carry `$deprecated`.

### What must hold once the variables exist

- `color/static/white` and `color/static/black` have the same value in the
  four modes.
- No alias of a `nova-light` or `nova-dark` mode points to a `violet` or a
  `mist` primitive: nova's neutrals are `stone`.
- `radius/surface`, `radius/control`, `radius/item`, `radius/inset`,
  `radius/mark` and `radius/pill` are `0` in `light` and `dark`, and `14`,
  `10`, `8`, `6`, `4` and `9999` in the two nova modes.
- `typography/size/ui` is `12` in lyra and `14` in nova.
- Every Semantic alias points to the `Primitive` collection, and every
  Component alias to the `Semantic` one.
- `typography/size-line-height/description` is `19.5` in `light` and `dark`,
  and `20` in the two nova modes.

---

## 5. Styles

### Text styles

`specs/foundations/typography.md` holds the type system. Each style binds its
family, size, line height and weight to Semantic variables, so that one style
follows the brand: lyra sets the interface in JetBrains Mono, nova in Lora with
DM Sans headings.

| Style                      | Family (`typography/font-family/…`) | Size and line height (`typography/size/…`) | Weight     | Letter spacing |
| -------------------------- | ----------------------------------- | ------------------------------------------ | ---------- | -------------- |
| `role/ui`                  | `body`                              | `ui`                                       | `normal`   | 0              |
| `role/ui-medium`           | `body`                              | `ui`                                       | `medium`   | 0              |
| `role/description`         | `body`                              | `description`                              | `normal`   | 0              |
| `role/title`               | `heading`                           | `title`                                    | `medium`   | 0              |
| `role/control`             | `body`                              | `control`                                  | `normal`   | 0              |
| `heading/1` to `heading/4` | `heading`                           | `2xl`, `xl`, `lg`, `base`                  | `semibold` | -2.5%          |
| `fixed/xs` to `fixed/4xl`  | `body`                              | `xs` to `4xl`, the 8 fixed sizes           | `normal`   | 0              |
| `code`                     | `mono`                              | `sm`, line height 162.5%                   | `normal`   | 0              |

A size takes the line height of the same name
(`typography/size-line-height/<name>`). A combination no style holds is set on
the layer with the same variables; it does not get a style.

In nova, the text typed in a field (`role/control`) is 16px on a phone and
14px from the `md` breakpoint up. A variable mode holds one value: the style
carries the 16px of the token.

### Effect styles

Figma has no shadow variable. Each of the 14 `primitive.elevation` tokens is an
effect style, named as the primitive is: `elevation/light/md`,
`elevation/dark/md`, for `xs`, `sm`, `md`, `lg`, `xl`, `2xl` and `inner`. A
`$value` is one layer or a list of layers; each has a color (`hex` and
`alpha`), `offsetX`, `offsetY`, `blur` and `spread` in pixels, and
`"inset": true` makes it an inner shadow.

The two schemes share their geometry and differ in the alpha of their layers. A
style does not follow a variable mode: a component drawn in a dark frame takes
the `dark` style by hand. Nova keeps lyra's shadows.

### Fonts and icons

- **Fonts**: JetBrains Mono and Geist for lyra; Lora, DM Sans and Geist Mono
  for nova. All five are Google Fonts, at weights 400 to 700.
- **Icons**: Phosphor only, the library the code imports
  (`@phosphor-icons/react`), in its `regular` weight, at 16px inside a
  component unless its spec's Tokens table names another size. The file holds
  its own: an `Icons` page with one component per icon the code imports, named
  as the import (`CheckIcon`), 16 by 16, its path taken from the `regular`
  weight of the package at the version of `package.json`. An icon in a
  component is an instance of one of them, never a drawn vector, so no icon
  library has to be enabled or published. They are placed before the
  components: Figma's agent does not create icons yet. The components import
  19: `ArrowDownIcon`, `CaretDownIcon`, `CaretLeftIcon`, `CaretRightIcon`,
  `CaretUpIcon`, `CheckCircleIcon`, `CheckIcon`, `CopyIcon`, `DotsThreeIcon`,
  `EyeIcon`, `EyeSlashIcon`, `InfoIcon`, `MagnifyingGlassIcon`, `MinusIcon`,
  `SidebarIcon`, `SpinnerIcon`, `WarningIcon`, `XCircleIcon` and `XIcon`.
  The page also holds `PlusIcon`, which no component imports: the site's
  icon-only Button examples show it.
- **An icon the page lacks**: the `Icons` page is not a closed set, since the
  code can import any Phosphor icon. When a screen needs one that is missing:
  1. no icon of the page already says it (`XIcon` closes, `CheckIcon`
     confirms);
  2. it comes from Phosphor, never drawn and never from another set;
  3. it joins the `Icons` page first, in the format of the others — named as
     its import (`BankIcon`), `regular`, 16 by 16, with a description of what
     it stands for — and the screen takes an instance;
  4. another size is set on the instance, and its color is the color of the
     text beside it.

  An agent that can write vectors, through Figma's MCP server, adds the
  component from the package's path. One that cannot stops and names the
  Phosphor icon it lacks: it draws no look-alike. The `Icons` page carries the
  same rule in a Spec block, for the people who design in the file.

- **Artwork**: `Logo` and `Illustration` are placeholders drawn as inline SVG in
  `components/ui/logo.tsx` and `components/ui/illustration.tsx`. Their paths
  are imported from those files.

---

## 6. Structure of the file

| Page                                  | Holds                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cover`                               | The name, the version built from (`v0.5.0`), the two links                                                                                                          |
| `Foundations`                         | One section per foundation that Figma can show: color (the semantic roles, in the four modes), typography, radius, spacing, elevation, focus, icons, motion as text |
| `Icons`                               | The 19 Phosphor icons the components import, one component each (§ 5)                                                                                               |
| One page per category, 11 in all      | The components of the category, one section per component: the component set, then its parts                                                                        |
| `Theme check`                         | The same sample of components in four frames, one per mode of the `Semantic` collection                                                                             |
| `Patterns`, once the components exist | The 12 page patterns of `specs/patterns/`, each as a screen made of instances                                                                                       |

The 67 components by category, as each spec's Metadata says (`beta` marks the
17 components whose API can still change):

| Category     | Components                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forms        | Button, Checkbox, Combobox (beta), Command, Field (beta), Input, InputGroup (beta), InputOtp, Label, NativeSelect, PasswordInput, RadioGroup, Select, Slider, Switch, Textarea, Toggle |
| Layout       | AspectRatio, Card, Collapsible, Direction (beta), Resizable, ScrollArea, Separator, Sidebar, Skeleton                                                                                  |
| Overlay      | AlertDialog, ContextMenu, Dialog, Drawer, DropdownMenu, HoverCard, Popover, Sheet                                                                                                      |
| Navigation   | Accordion, Breadcrumb, Menubar, NavigationMenu, Pagination, Tabs                                                                                                                       |
| Data         | Calendar, Carousel, Chart, Progress, Table                                                                                                                                             |
| Feedback     | Alert, Empty (beta), Sonner, Spinner (beta), Tooltip                                                                                                                                   |
| Conversation | Attachment (beta), Bubble (beta), Marker (beta), Message (beta), MessageScroller (beta), Questionnaire (beta), Trace (beta)                                                            |
| Misc         | Avatar, Badge, ButtonGroup (beta), Item (beta), Kbd (beta), ToggleGroup                                                                                                                |
| Typography   | CodeBlock (beta), Heading                                                                                                                                                              |
| Media        | Illustration                                                                                                                                                                           |
| Brand        | Logo                                                                                                                                                                                   |

---

## 7. Components

One component of the code is one section of its category page. Read its spec
first, whole.

| In the spec                        | In Figma                                                                                                                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Metadata**, **Role**             | The component's name, its React export (`Button`, `CardHeader`, `DropdownMenuItem`), and its description, in plain text with no HTML entity: the Role sentence, `beta` when the status says so, and the link to the spec                                     |
| **Anatomy**                        | The layers. A part that has its own export is its own component, placed in the section of its root and nested as an instance; a layer is named after its `data-slot`                                                                                         |
| **Variants**, **Props / API**      | The properties. A `cva` axis or a prop typed as a union of literals is a variant property, named as the prop and holding its values as written; a `boolean` prop is a boolean property; the text child is a text property; the default of each is the code's |
| **States**                         | A `state` variant property, holding the states the table lists and no other. Button has `default`, `hover`, `focus`, `active`, `open`, `disabled`, `error` and `loading`                                                                                     |
| **Tokens**                         | The bindings. Each row names a token, the classes that read it and the part or the variant that carries them: bind the variable of that token, at that place                                                                                                 |
| **Constraints**, **Accessibility** | The component's description keeps the constraints a designer can break: an icon-only button needs a name, a view takes at most two primary buttons                                                                                                           |

How a class becomes a property of a layer:

- **Layout**: every component is an auto layout frame. `gap-*`, `p-*`, `px-*`,
  `h-*` and `size-*` read the spacing scale: `h-8` is `space/scale/8`, 32px;
  `px-2.5` is `space/scale/2-5`.
- **Corners**: the radius role its Tokens table names (`radius/control` for a
  button, `radius/surface` for a card), never a number. Lyra is square because
  its roles are `0`, not because the corner is unset. A seam (`rounded-none`)
  is `0`, and a round shape (`rounded-full`) is fully rounded, in every brand.
- **Borders**: `border` is a 1px inside stroke, counted in the layout, its
  weight bound to `border-width/default`. The code counts the border in the
  size of the element, so `border-transparent` keeps that stroke, bound to
  `color/border/default` at 0% opacity: without it a variant is 2px narrower
  than its outlined sibling, and a button grows when it takes focus. Every
  variant of one size has the same width in every state that adds no content.
- **Text**: a text layer takes the text style of its size and weight. When a
  class leaves every style — `font-medium` on `text-xs`, `leading-none`,
  `underline` — the layer takes no style and binds the same variables itself:
  family, size, line height and weight. `leading-none` is a line height of
  100%.
- **The text of a field**: a field shows a typed value in `color/text/default`,
  behind a text property named `value`. The placeholder, in
  `color/text/subtle`, shows in the `placeholder` state only.
- **A color with an opacity modifier**: `bg-destructive/10` is the variable of
  `color.feedback.error.default` on a fill at 10% opacity.
- **Disabled**: the layer's opacity bound to `opacity/disabled`.
- **Focus**: one ring for every component, from `specs/foundations/focus.md`: a
  1px solid stroke in `color/border/focus`, and around it a halo
  `space/focus-ring-width` wide (2px) in the same color at 50%, the weight of
  each bound to its variable. A destructive or invalid control draws the ring
  its States table gives.
- **Target size**: a pointer target is at least `size/target/min`, 24px.

The size of a component set stays bounded: the full matrix of `variant` and
`size` at the `default` state, and the other states for every `variant` at the
default size.

An overlay (Dialog, Popover, DropdownMenu, Tooltip, Sheet, Drawer…) is drawn
open: its content panel is the component, and its trigger is an instance of
Button.

Five components are not a drawing of their own:

| Component         | What to build                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Direction`       | Nothing: a provider of the reading direction, with nothing to render                                                        |
| `AspectRatio`     | A frame with a locked ratio, shown at 16:9, 4:3 and 1:1                                                                     |
| `Sonner`          | The toast it renders, in each of its types (`success`, `error`, `warning`, `info`, `loading`)                               |
| `Chart`           | Its container, tooltip and legend, bound to `color/chart/1` to `color/chart/5`. A plot is a static example, not a component |
| `MessageScroller` | Its frame and its two jump buttons; scrolling is behavior                                                                   |

### The order

A component is built after the components it renders. From the dependencies of
`registry.json`:

1. **First, 47 components that render no other**: Accordion, Alert, AspectRatio,
   Avatar, Badge, Breadcrumb, Bubble, Button, Card, Chart, Checkbox,
   Collapsible, ContextMenu, Direction, Drawer, DropdownMenu, Empty, Heading,
   HoverCard, Illustration, Input, InputOtp, Kbd, Label, Logo, Marker, Menubar,
   Message, NativeSelect, NavigationMenu, Popover, Progress, RadioGroup,
   Resizable, ScrollArea, Select, Separator, Skeleton, Slider, Sonner, Spinner,
   Switch, Table, Tabs, Textarea, Toggle, Tooltip.
2. **Then 16 that render one of them**: AlertDialog, Attachment, ButtonGroup,
   Calendar, Carousel, CodeBlock, Dialog, Field, InputGroup, Item,
   MessageScroller, Pagination, Questionnaire, Sheet, ToggleGroup, Trace.
3. **Then 4**: Combobox, Command, PasswordInput, Sidebar.

Button, Input, Label, Separator and Spinner come first within the first group:
most of the others hold one.

---

## 8. Prompts

One phase per prompt, in a new chat each time, with the files of § 1 attached.
Check each phase (§ 10) before starting the next.

**Variables**

```text
Build the variables of the DSAIReadable design system in this file, from the
attached token files. Follow § 4 of the attached FIGMA_REINTEGRATION.md exactly:
three collections (Primitive, Semantic, Component), four modes on Semantic
(light, dark, nova-light, nova-dark), each variable named by its token path
with slashes, each Semantic variable an alias of a Primitive variable in every
mode, with the fallback of the Themes table and the one exception § 4 names
(typography/size-line-height/description). Take each color from the hex and
alpha of tokens/primitive.json. Invent no variable. When you are done, report
the number of variables per collection and every token you could not create.
Source: https://github.com/Toniio/DSAIReadable.git at tag v0.5.0.
```

**Styles**

```text
Create the text styles and the effect styles of § 5 of the attached
FIGMA_REINTEGRATION.md, bound to the Semantic variables of this file. The
attached typography.md and elevation.md are the reference; primitive.json holds
the layers of each shadow. Then build the Foundations page of § 6. Create no
style that § 5 does not list.
```

**Components, one batch**

```text
Build these components of the DSAIReadable design system on the <Category>
page: <Component>, <Component>, <Component>. Their specs are attached, with a
screenshot of each from https://toniio.github.io/DSAIReadable/components/.
Follow § 3 and § 7 of the attached FIGMA_REINTEGRATION.md: names, properties
and values exactly as the spec writes them, every fill, stroke, radius, gap and
text bound to the variable its Tokens table names, auto layout everywhere, the
states of its States table. Bind every stroke weight to its variable, and keep
the 1px stroke of a transparent border. Use the components this file already
has as instances, and take every icon from the components of the Icons page:
when one is missing, stop and name it. Report every class you could not
express, by component.
```

**Check**

```text
Audit this file against § 10 of the attached FIGMA_REINTEGRATION.md. For each
check, answer pass or fail with the layers that fail. Change nothing.
```

Batches of three to five components keep a prompt within what the agent holds
at once: a spec runs from 120 to 465 lines.

---

## 9. What Figma does not hold

Each of these is a declared difference between the library and the code, not a
defect to work around:

| In the code                                                        | In Figma                                                                                                                                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colors in OKLCH                                                    | sRGB, from the `hex` each primitive carries                                                                                                                                 |
| Sizes in `rem`                                                     | Pixels, at 16 to the `rem`                                                                                                                                                  |
| Letter spacing in `em`                                             | A percentage in the text styles                                                                                                                                             |
| Shadows that follow the color scheme                               | Two sets of effect styles, switched by hand                                                                                                                                 |
| `dark:` classes: 21 components bind a different token in dark mode | A variable mode changes a value, not which variable a layer reads. The component holds the light binding, and each such layer is listed in the build report, with its class |
| Motion (`motion.duration.*`, `motion.easing.*`), reduced motion    | Text on the Foundations page. Prototyping is set by hand                                                                                                                    |
| Stacking order (`zindex.*`)                                        | Documentation only                                                                                                                                                          |
| Breakpoints, responsive classes (`md:text-ui`)                     | Numbers for frame widths; a component is drawn at its base size                                                                                                             |
| Keyboard behavior, roles, accessible names                         | The spec's Accessibility section; nothing to draw                                                                                                                           |
| Default strings (`lib/ui-strings.ts`)                              | The text of the layers, in English as the code ships them                                                                                                                   |

---

## 10. Checks

**Variables**

- [ ] Three collections: `Primitive` (263 variables, hidden from publishing),
      `Semantic` (207, four modes), `Component` (33).
- [ ] Every Semantic and Component variable is an alias; none holds a raw value,
      except `typography/size-line-height/description` in `light` and `dark`.
- [ ] The six statements of § 4, _What must hold once the variables exist_.
- [ ] Every published variable has its description and its Web code syntax.

**Styles**

- [ ] 18 text styles, each bound to variables for family, size, line height and
      weight.
- [ ] 14 effect styles, `elevation/light/*` and `elevation/dark/*`.

**Components**

- [ ] 66 component sections, Direction left out, each on the page of its
      category.
- [ ] Each property and each value of a component exists in its spec, with the
      same spelling and the same default.
- [ ] No layer holds a raw color, radius, gap, stroke weight or font size; none
      reads a Primitive variable.
- [ ] Every variant of one size has the same width in every state that adds no
      content (`loading` adds a spinner).
- [ ] A text layer has a text style, or its family, size and weight bound to
      variables.
- [ ] Switching a frame through the four modes changes colors in all four, and
      corners, typefaces and component text sizes between lyra and nova.
- [ ] Every focusable component has its `focus` state, with the ring of § 7.
- [ ] Every icon is an instance of a component of the `Icons` page.

**Against the site**

- [ ] Each component, side by side with its page of the site in lyra light and
      nova dark: same spacing, same corners, same colors.

---

## 11. Once the library exists

1. **Publish it** when other files are to use it, with the `Primitive`
   collection hidden. A library that stays in its own file skips this step and
   the next: guidelines attach to a published library.
2. **Attach guidelines to it** (_Library → Manage guidelines_), so that the
   agent follows the system when it designs with the library. Figma takes
   Markdown, text and JSON files, 200 KB in all, and recommends three to eight
   files under 100 KB
   ([Add guidelines files to a design library](https://help.figma.com/hc/en-us/articles/43509372175511-Add-guidelines-files-to-a-design-library)).
   Five foundations fit, at 94 KB: `specs/foundations/color.md`,
   `typography.md`, `radius.md`, `spacing.md` and `voice-and-tone.md`. They are
   written for code, and name the same roles and tokens the variables carry.
3. **Report the node ids.** Every spec keeps an empty `figma_node_id` row in its
   Metadata, the anchor for the Figma component. Filling those rows is a change of
   this repository, with its own pull request.
4. **Decide what comes back into the repository.** The removed layer did five
   jobs, each independent of the others:

   | Job                                                                | State                                                                                             |
   | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
   | Creating the Figma components from the code                        | Replaced by this document and the Figma agent                                                     |
   | Pushing the tokens to Figma variables                              | Replaced by § 4. A script returns only if the variables must follow each release without a prompt |
   | Detecting drift between the tokens and the variables               | Not rebuilt. It was part of `tokens-validate`, so it could fail CI on a change made in Figma      |
   | Code Connect, the mapping from a Figma component to its React code | Not rebuilt. With names and values verbatim (§ 3), a mapping is one line per component            |
   | Inventory metadata (`figma_node_id`, the library's file key)       | The empty row of each spec; nothing reads it today                                                |

   The spec of that layer — its scripts, its dependencies, its configuration and
   the node ids of the former file — is the version of this document at the
   `v0.5.0` tag:
   [`FIGMA_REINTEGRATION.md` at v0.5.0](https://github.com/Toniio/DSAIReadable/blob/v0.5.0/FIGMA_REINTEGRATION.md).
   It describes the 59 components and the two themes of September 2026, and its
   node ids belong to a file that is no longer the reference.

The key of the Figma file and any access token stay out of the repository.
