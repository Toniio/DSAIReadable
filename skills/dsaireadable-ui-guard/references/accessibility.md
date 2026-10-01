# Accessibility at design time

Accessibility is decided while the screen is designed, not patched in an audit.
The target is WCAG 2.2 AA.

- **MUST** name every control and region: an `aria-label` on an icon-only
  button, a `DialogTitle` or `AlertDialogTitle` in every dialog, a caption or
  `aria-label` on a table, a name on a search field that says what it
  searches. _Perceivable: what has no name does not exist for a screen
  reader._ `spec:Button` `spec:Dialog` `spec:AlertDialog` `spec:Table`
  `pattern:search`
- **MUST** name each loading indicator after what loads, never with the
  default "Loading", and announce result counts politely. _Status messages are
  content too._ `spec:Spinner` `pattern:loading` `pattern:filter`
- **MUST** keep the focus visible on every control: the design system's focus
  ring, never removed. _Operable: a keyboard user follows the focus or nothing._
  `foundation:focus`
- **MUST** keep the trigger of a dialog mounted while the dialog is open, so
  the focus returns to it on close. _Predictable: the focus never lands
  nowhere._ `spec:Dialog`
- **MUST** keep every click target at the minimum target size and never
  overlap two; never shrink a button below its smallest size. _Fitts, and WCAG
  2.5.8 target size._ `foundation:size` `spec:Button`
- **NEVER** show a state by color alone: pair it with text or an icon. _About
  one man in twelve does not see the difference._ `spec:Button`
  `foundation:color`
- **MUST** check the screen in light and dark, with semantic classes only, so
  every contrast holds in both. _Contrast is a property of each mode._
  `foundation:color`
- **NEVER** hide information a person needs in a `Tooltip` alone, or put a
  tooltip directly on a disabled element. _A tooltip is invisible on touch and
  unreachable on a disabled control._ `spec:Tooltip`
