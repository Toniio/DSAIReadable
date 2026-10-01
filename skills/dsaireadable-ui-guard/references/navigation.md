# Navigation and orientation

At any moment the person should be able to answer: where am I, what can I do
here, how do I get back.

- **MUST** frame every page of an app in the same shell, the sections in a
  `Sidebar` with the current one marked `isActive`. _Consistency and
  orientation: the same place, every time._ `pattern:navigation`
  `spec:Sidebar`
- **MUST** show a `Breadcrumb` above the title on a page nested as deep as the
  navigation pattern and the Breadcrumb spec say, its last item the current
  page and not a link.
  _Wayfinding: the path back is visible._ `pattern:navigation`
  `spec:Breadcrumb`
- **MUST** give every view a way back or onward — a breadcrumb, a back link, a
  Cancel — and never a dead end. _User control and freedom._
  `pattern:navigation`
- **MUST** use `Tabs` only to switch between views of one object, within the
  Tabs limit; separate pages are links. _Mapping: a tab promises the same
  object seen another way._ `spec:Tabs` `pattern:navigation`
- **MUST** split a long collection into pages, or load more on demand, as the
  navigation pattern sets it. _Control: the person decides when to see more._
  `pattern:navigation` `spec:Pagination`
- **MUST** keep the state of filters and search in the URL, apply filters as
  they are picked, and say how many results match. _Visibility of system
  status, and a view that can be shared and restored._ `pattern:filter`
  `pattern:search`
- **NEVER** use a `DropdownMenu` as the app's main navigation. _Hidden
  navigation is forgotten navigation._ `spec:DropdownMenu`
- **SHOULD** split a settings page into tabs, then sidebar groups, past the
  card counts the settings pattern names. _Chunking: a long scroll of
  unrelated settings hides each one._ `pattern:settings`
