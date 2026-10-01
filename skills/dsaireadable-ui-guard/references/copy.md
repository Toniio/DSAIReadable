# Microcopy

Words are interface. The design system's voice is warm and human, clear first.

- **MUST** write every string in sentence case, accessible names included.
  _Readable and consistent: capitals slow reading down._
  `foundation:voice-and-tone`
- **MUST** start a button with a verb that names its result ("Create project",
  "Send invoice"), never "Submit", "OK" or "Yes"; a confirmation repeats the
  verb of its question. _Predictability: the label says what happens on
  select._ `foundation:voice-and-tone` `pattern:form`
- **MUST** write an error as what happened, then how to fix it, without blame.
  _Help users recover: "Enter an email address, like name@example.com" fixes,
  "Invalid input" does not._ `foundation:voice-and-tone` `pattern:saving`
- **NEVER** write "please", "oops" or "whoops", or an exclamation mark in an
  error. _"Please" turns an instruction into a favor; "oops" makes light of a
  problem._ `foundation:voice-and-tone`
- **MUST** use the word list: "sign in", "email", "select", "delete" for a
  permanent loss and "remove" for what can be undone. _One term per action, so
  the person learns it once._ `foundation:voice-and-tone`
- **MUST** speak to the reader as "you", and let the product say "we" when it
  acts or fails. _Human, not system._ `foundation:voice-and-tone`
- **NEVER** tell which credential was wrong on a failed sign-in. _Security
  without blame: the message helps the person, not an attacker._
  `pattern:sign-in`
- **MUST** keep the component strings from `UI_STRINGS`, and change one only
  through its override prop — to translate it, for example. _One source per
  string, so the voice holds everywhere._ `foundation:content`
- **MUST** keep a badge to a few words and a tooltip to one short line, as
  their specs bound them. _Glanceable text is short text._ `spec:Badge`
  `spec:Tooltip`
