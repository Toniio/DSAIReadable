# Forms

A form is a conversation: it asks one thing at a time, says what it expects,
and says exactly what to fix.

- **MUST** compose every field with `Field`: a visible `FieldLabel` above its
  control, one column, related fields in a `FieldSet` with a `FieldLegend`.
  _Recognition over recall: a placeholder disappears as soon as the person
  types, and with it the question._ `pattern:form` `spec:Field`
- **MUST** mark optional fields with "(optional)" in the label and leave the
  required ones unmarked; never an asterisk. _Most fields are required, so
  the exception is what gets marked._ `pattern:form`
- **MUST** pick each selection control from its number of options, as the
  form pattern counts them: radio buttons for a few, a select for more, a
  combobox for many, checkboxes for several values. _Hick: show every option
  when there are few, search them when there are many._ `pattern:form`
- **MUST** validate on submit, then recheck a field on each change once it
  shows an error, and move the focus to the first field in error. _Error
  prevention without nagging: no red before the person is done._ `pattern:form`
- **MUST** show each error in a `FieldError` under its field, with
  `data-invalid` on the `Field` and `aria-invalid` on the control, saying what
  to change. _Proximity: the fix sits where the problem is, and assistive
  technology announces it._ `pattern:form` `spec:Field`
- **NEVER** disable the submit button to signal a missing value: let the
  person submit, then say what is missing. _Visibility of system status: a
  gray button explains nothing._ `pattern:form`
- **MUST** place the submit button after the last field, named after the task
  ("Create project"), then `Cancel` when the form can be left. _Flow: the
  action comes when the work is done._ `pattern:form` `pattern:create`
- **MUST** keep every typed value when a submit fails, and show a pending
  state on the submit button so it cannot send twice. _Never make the person
  redo work the system lost._ `pattern:saving` `pattern:create`
- **MUST** use a `Dialog` only for a form within the size the create pattern
  allows; a longer one is a page. _A modal is an interruption: keep it short._
  `pattern:create` `pattern:edit`
- **SHOULD** ask at creation only what creation needs, and leave the rest to
  the edit page. _Fewer fields, more completions._ `pattern:create`
- **MUST** save an edit page with an explicit "Save changes", fields prefilled
  with the current values. _User control: nothing changes until the person
  says so._ `pattern:edit`
