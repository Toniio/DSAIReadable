# Restraint and dark patterns

Do less before you optimize. Every element added costs attention; every trick
that pushes a choice costs trust.

- **MUST** keep each screen to what its task needs, and leave the rest to a
  later step. _Cognitive load: each extra field, button or panel is one more
  thing to read and decide._ `pattern:create`
- **MUST** stay within each component's limits — actions in a `CardFooter`,
  actions in an `Item` before the rest go to a menu, fields in a `Popover` —
  as their specs count them. _Hick: the limits are where the choice stays
  quick._ `spec:Card` `spec:Item` `spec:Popover`
- **NEVER** stack overlays: one `Dialog` or `AlertDialog` at a time. _A modal
  over a modal hides the way back._ `spec:Dialog` `spec:AlertDialog`
- **NEVER** mix a `Switch`, which applies at once, with fields that wait for
  a save in the same card. _Consistency: one card, one way to save._
  `pattern:settings`
- **NEVER** shame a refusal: the way out of an offer reads "Not now" or
  "Cancel". _Confirmshaming trades trust for a click._
  `foundation:voice-and-tone`
- **NEVER** pre-check a consent, a subscription or a paid option: the person
  opts in themselves. _A choice made for someone is not their choice._
  `pattern:form`
- **NEVER** put a success or a failure the person must act on in a toast that
  disappears. _What needs action must stay until it is acted on._
  `pattern:saving` `spec:Sonner`
