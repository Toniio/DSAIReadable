/**
 * Every default string a component renders without being asked to.
 *
 * These are not copy. They are the accessible names of controls that have no
 * visible label - the dialog's close button, the carousel's arrows, the
 * password toggle - plus the two landmark names screen readers announce. A
 * component that invents its own wording gives an agent nothing to find and a
 * translator nothing to replace.
 *
 * The defaults are English. Any other locale is supplied by the caller through
 * the override prop each component exposes; nothing here reads a locale, and
 * nothing here is reactive.
 */
export const UI_STRINGS = Object.freeze({
  breadcrumb: Object.freeze({
    /** Name of the <nav> landmark. */
    landmark: "breadcrumb",
    /** Announced for the collapsed middle of the trail. */
    ellipsis: "More",
  }),
  carousel: Object.freeze({
    previous: "Previous slide",
    next: "Next slide",
  }),
  combobox: Object.freeze({
    /** The caret button that opens the list. */
    trigger: "Open list",
    clear: "Clear selection",
    /** The button that removes a chip from a multiple selection. */
    remove: "Remove",
  }),
  dialog: Object.freeze({
    close: "Close",
  }),
  illustration: Object.freeze({
    /** Fallback alternative text; a decorative image should pass alt="". */
    alt: "Illustration",
  }),
  pagination: Object.freeze({
    /** Name of the <nav> landmark. */
    landmark: "pagination",
    previousText: "Previous",
    previousLabel: "Go to previous page",
    nextText: "Next",
    nextLabel: "Go to next page",
    /** Announced for the skipped range of pages. */
    ellipsis: "More pages",
  }),
  passwordInput: Object.freeze({
    show: "Show password",
    hide: "Hide password",
  }),
  sheet: Object.freeze({
    close: "Close",
  }),
  sidebar: Object.freeze({
    toggle: "Toggle Sidebar",
  }),
  spinner: Object.freeze({
    /** Name of the role="status" region. */
    label: "Loading",
  }),
})

export type UiStrings = typeof UI_STRINGS
