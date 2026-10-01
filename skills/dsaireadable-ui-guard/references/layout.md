# Hierarchy and layout

The eye needs one place to start and one thing to do next. Each rule names the
principle it serves and the source that writes it in full.

- **MUST** give the page one `Heading level={1}`, with the page's main action
  beside it, and never skip a heading level. _Orientation: the title says
  where the person is, the action next to it says what they came for._
  `pattern:navigation` `spec:Heading`
- **NEVER** put more `default` (primary) buttons in one view than the Button
  spec allows: the other actions are `outline`, `secondary` or `ghost`. _Von
  Restorff and Hick: emphasis works only when it is rare, and every extra
  primary lengthens the decision._ `spec:Button`
- **MUST** group related content in one `Card` per group — one per group of
  related fields on an edit or settings page — and never nest a Card more than
  the Card spec allows. _Gestalt, common region: a boundary says "these belong
  together"; boxes inside boxes say nothing._ `spec:Card` `pattern:edit`
  `pattern:settings`
- **MUST** take every gap and padding from the spacing scale: component
  spacing inside a component, layout spacing between regions, the page padding
  once on the root container. _Rhythm: equal steps read as order, odd steps as
  mistakes._ `foundation:spacing` `pattern:navigation`
- **MUST** use the page container width the navigation pattern names for the
  kind of page, and the narrower one of the form pattern for a form, an edit
  page or a settings page. _Line length and focus: a form stretched across a
  wide screen loses the eye between label and field._ `pattern:navigation`
  `pattern:form`
- **MUST** pick the presentation of a collection by its shape: a `Table` for
  rows that share several attributes, an `Item` list for a vertical list, a
  `Card` for a self-contained block — and never a `Table` for layout.
  _Mapping: the structure on screen mirrors the structure of the data._
  `spec:Table` `spec:Item` `spec:Card`
- **SHOULD** hide the secondary columns of a wide `Table` on a small screen,
  past the column count the Table spec names. _Density: what cannot be read is
  noise._ `spec:Table`
- **NEVER** put `onClick` on a `Card`: make its title a link or a button. _Affordance:
  a click target is announced and reachable, a clickable box is neither._
  `spec:Card`
