# States

Every view has more than one state. Design each one, or the person meets a
blank space and has to guess.

- **MUST** design the empty, loading, error and success states of every view
  that loads or lists something; never leave a blank area. _Visibility of
  system status._ `pattern:empty-state` `pattern:loading` `pattern:saving`
- **MUST** fill an empty collection with one `Empty`, in place of the list,
  keeping the page header and its create action; its message follows the
  cause (first use, no match, all done, no access). _A blank page reads as
  broken; the next step turns it into a start._ `pattern:empty-state`
  `spec:Empty`
- **NEVER** show an `Empty` for a load failure or a server error: that is an
  `Alert variant="destructive"` that says how to recover. _Honesty: "nothing
  here" and "we could not load it" are different facts._ `pattern:empty-state`
  `spec:Alert`
- **MUST** match the indicator to the wait: `Skeleton`s shaped like the
  content for a known layout, a `Spinner` inside the button that started an
  action, `Progress` for a long or measurable task — and nothing for a wait
  too short to notice. _The indicator says how long, not just "busy"._
  `pattern:loading` `spec:Spinner` `spec:Skeleton`
- **NEVER** block the whole page while one region loads: the header and the
  navigation stay usable, and the loading region carries `aria-busy`. _User
  control: waiting for one thing never freezes everything._ `pattern:loading`
- **MUST** replace the indicator with the content, the empty state or the
  error the moment the request ends. _A spinner that outlives its request
  lies._ `pattern:loading`
- **MUST** confirm a completed save or creation once, the way the saving
  pattern says; a `Switch` confirms nothing, its new position is the
  confirmation. _Feedback proportional to the action._ `pattern:saving`
  `pattern:settings`
- **MUST** recover from a failure in place: keep the values, say what happened
  and how to fix it, and offer to try again. _Error recovery: the person
  should never start over._ `pattern:saving` `pattern:sign-in`
