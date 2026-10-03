/**
 * What puts a component in a state, for the "Set by" column of the States
 * table: the reader's interaction, a prop, an attribute, or the library.
 * Covers every state name the 65 specs' States tables use; a component
 * whose state comes from somewhere else has its own entry.
 */

/** The state names most components share. */
const SHARED: Record<string, string> = {
  default: "Nothing: the state at rest",
  hover: "Interaction: the pointer over it",
  focus: "Interaction: keyboard focus",
  active: "Interaction: a press",
  disabled: "The `disabled` prop",
  error: "`aria-invalid`",
  open: "The trigger, or the `open` prop",
  closing: "`Escape`, a click outside, a close control, or `open={false}`",
  loading: "A child `Spinner`, with `aria-busy`",
  checked: "A click, or the `checked` prop",
  unchecked: "A click, or `checked={false}`",
  indeterminate: '`checked="indeterminate"`',
  selected: "A click, or the `value` prop",
  pressed: "A click, or the `pressed` prop",
  highlighted: "The arrow keys, or the pointer",
  placeholder: "No value yet, with a `placeholder`",
  vertical: '`orientation="vertical"`',
  end: '`align="end"`',
}

/** Where one component sets a state differently, by component, then state. */
const BY_COMPONENT: Record<string, Record<string, string>> = {
  Accordion: {
    open: "A click, `Enter` or `Space` on the trigger, or `value`",
    closing: "A click, `Enter` or `Space` on the open trigger",
  },
  Alert: {
    error: '`variant="destructive"`',
    destructive: '`variant="destructive"`',
    success: '`variant="success"`',
    warning: '`variant="warning"`',
  },
  AlertDialog: {
    closing: "The Action or Cancel button, `Escape`, or `open={false}`",
  },
  Attachment: {
    idle: '`state="idle"`',
    uploading: '`state="uploading"`',
    processing: '`state="processing"`',
    error: '`state="error"`',
    done: '`state="done"`',
  },
  Avatar: {
    "image-loaded": "The image loading",
    "image-error": "The image failing to load",
  },
  Badge: { error: "`aria-invalid`" },
  Breadcrumb: { disabled: '`aria-disabled="true"` on `BreadcrumbPage`' },
  Button: { open: "`aria-expanded`, from the popup it controls" },
  ButtonGroup: { disabled: "The `disabled` prop of each child" },
  Calendar: {
    disabled: "The `disabled` prop: a matcher of days",
    selected: "A click on a day, or the `selected` prop",
  },
  Card: { loading: "A `Skeleton` inside `CardContent`" },
  Carousel: { disabled: "The scroll limit: first or last slide" },
  Combobox: {
    open: "Typing, the trigger, or the `open` prop",
    pressed: "Opening the popup",
    empty: "A query no option matches",
    disabled: "The `disabled` prop, on the input or an item",
  },
  Command: {
    selected: "The arrow keys, or the pointer",
    checked: '`data-checked="true"` on an item',
    disabled: "The `disabled` prop of an item",
  },
  ContextMenu: {
    open: "A right-click, or a long press",
    disabled: "The `disabled` prop of an item",
  },
  Drawer: {
    open: "The trigger, a swipe, or the `open` prop",
    closing: "A swipe, `Escape`, a click on the overlay, or `open={false}`",
    dragging: "A swipe, or a drag on the panel",
  },
  DropdownMenu: { disabled: "The `disabled` prop of an item" },
  Field: {
    disabled: '`data-disabled="true"` on `Field`',
    error: '`data-invalid="true"` on `Field`, `aria-invalid` on the control',
    checked: "A checked control inside a `FieldLabel`",
  },
  HoverCard: {
    open: "The pointer resting on the trigger, or focus on it",
    closing: "The pointer leaving, or the trigger losing focus",
  },
  Item: {
    outline: '`variant="outline"`',
    muted: '`variant="muted"`',
  },
  Kbd: { "in-tooltip": "Being inside a `TooltipContent`" },
  Label: {
    disabled: "A disabled `peer` control before it",
    error: '`data-invalid="true"` on the `Field` around it',
  },
  Menubar: {
    open: "A click on a menu's trigger, or the `value` prop",
    disabled: "The `disabled` prop of an item",
  },
  Message: { ghost: 'A `Bubble` with `variant="ghost"` inside it' },
  MessageScroller: {
    pending: "The first render, until the scroll position is applied",
    scrolled: "The reader scrolling up",
  },
  NavigationMenu: {
    open: "The pointer on a trigger, a click, or the `value` prop",
  },
  NativeSelect: {
    open: "The browser, on a click or a key",
    placeholder: 'The selected option has `value=""`',
  },
  PasswordInput: {
    visible: "The show password button",
    error: "`aria-invalid`, through `InputGroup`",
  },
  Questionnaire: {
    open: "`aria-expanded`, from the popup it controls",
    error: "`data-invalid` on a choice, `aria-invalid` on the input",
    checked: "A click on a choice",
    disabled: "`data-disabled` on a choice, `disabled` on the input",
  },
  RadioGroup: {
    checked: "A click, or the `value` prop of the group",
    unchecked: "Another item chosen, or no `value`",
  },
  Resizable: { disabled: "The `disabled` prop of the handle" },
  Select: { disabled: "The `disabled` prop, on the trigger or an item" },
  Sidebar: {
    open: "Opening the menu a menu button controls",
    disabled: "The `disabled` prop of an item",
    collapsed:
      "The `SidebarTrigger`, the keyboard shortcut, or the `open` prop of `SidebarProvider`",
    mobile: "A viewport under the mobile breakpoint (`useIsMobile`)",
  },
  Sonner: {
    error: "`toast.error()`",
    success: "`toast.success()`",
    warning: "`toast.warning()`",
    info: "`toast.info()`",
    loading: "`toast.loading()`",
  },
  Spinner: { loading: "Rendering it" },
  Tabs: { disabled: "The `disabled` prop of a `TabsTrigger`" },
  Table: {
    open: "An expanded control in the row (`aria-expanded`)",
    selected: '`data-state="selected"` on a `TableRow`',
  },
  ToggleGroup: {
    pressed: "A click, or the `value` prop of the group",
    disabled: "The `disabled` prop, on the group or an item",
    "spacing-0": "`spacing={0}`",
  },
  Tooltip: {
    open: "The pointer resting on the trigger, or focus on it",
    closing: "The pointer leaving, the trigger losing focus, or `Escape`",
  },
}

/** A description that says the state does not apply: "Not applicable", "N/A". */
const NOT_APPLICABLE =
  /^[—\s(]*(not applicable|n\/a|not defined|not supported)/i

/** Whether a States row describes a state the component has. */
export function applies(description: string): boolean {
  return !NOT_APPLICABLE.test(description)
}

/** What sets a state of a component, as Markdown. */
export function setBy(
  component: string,
  state: string,
  description: string
): string {
  if (!applies(description)) return "—"
  return (
    BY_COMPONENT[component]?.[state] ??
    SHARED[state] ??
    "A prop or an attribute: see the description"
  )
}
