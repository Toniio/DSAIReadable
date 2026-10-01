# Feedback and destructive actions

The cost of a mistake decides the friction: none for what can be undone, a
deliberate step for what cannot.

- **MUST** confirm an irreversible action in an `AlertDialog` whose title
  names the object ("Delete "Q3 launch"?"), whose description says what is
  lost, and whose confirm button repeats the verb and the object with
  `variant="destructive"`; the way out is `Cancel`. _Error prevention: the
  person sees exactly what goes before it goes._ `pattern:delete`
  `spec:AlertDialog` `foundation:voice-and-tone`
- **NEVER** confirm a destructive action in a `Dialog`, or with "Are you
  sure?", "Yes" or "OK". _A generic question gets a reflex answer._
  `spec:Dialog` `pattern:delete`
- **MUST** act at once on a reversible action, with no confirmation, and offer
  Undo in the toast; call it "remove", not "delete". _Forgiveness beats
  friction: undo is cheaper than a dialog read a hundred times._
  `pattern:delete`
- **MUST** keep a destructive action away from the primary one: in a row's
  menu, or in a last "Danger zone" card on a settings page. _Fitts, in
  reverse: what must not be hit by accident is not put in the way._
  `pattern:delete` `pattern:settings`
- **MUST** guard unsaved changes when the person leaves, with the
  AlertDialog the saving pattern writes. _Never lose work silently._
  `pattern:saving` `pattern:edit`
- **MUST** keep toasts for confirmations: one `<Toaster />`, within the number
  and length Sonner allows, and never for a message the person must act on.
  _A toast disappears; what matters must not._ `spec:Sonner` `pattern:saving`
- **SHOULD** after a delete, return to the collection and confirm with one
  success toast. _Closure: the person sees the result of their action._
  `pattern:delete`
