# Voice and Tone — how the interface speaks

> Source: this file · Default strings: `lib/ui-strings.ts` · Guard: `npm run index:strings`

The voice is who we are in every sentence, and it does not change. The tone
is how that voice adapts to the moment: an error is not a success. Every text
the interface shows or announces follows it — labels, buttons, messages, empty
states, and the accessible names in `UI_STRINGS` ([content.md](./content.md)).

---

## Voice

Warm and human: the interface talks like a helpful colleague, not like a
system log.

| Principle                  | What it means                                                                        | Write                                                   | Not                              |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------- |
| **Clear first**            | Warmth never costs clarity: the reader understands what happened and what to do next | `We couldn't save your changes. Check your connection.` | `Something went wrong.`          |
| **Friendly, not familiar** | Contractions and "you"; no slang, no jokes, no pet names                             | `You're all set.`                                       | `Woohoo, you rock!`              |
| **Encouraging**            | Celebrate briefly, guide the next step, never blame the reader                       | `Your first invoice is ready to send.`                  | `You entered an invalid date.`   |
| **Human**                  | Plain words from the reader's world, not the system's                                | `We couldn't find that page.`                           | `Error 404: resource not found.` |

---

## Tone by situation

| Situation                  | Tone                         | Write                                                                              | Not                                           |
| -------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| Error                      | Calm, helpful, no blame      | `We couldn't process your payment. Check your card number and try again.`          | `Oops! Payment failed!`                       |
| Destructive confirmation   | Serious, explicit            | `Delete these 3 projects? You won't be able to get them back.` · `Delete projects` | `Are you sure?` · `Yes`                       |
| Success                    | Warm, brief                  | `All set! Your changes are saved.`                                                 | `Success! Operation completed successfully!!` |
| Empty state                | Inviting, points to a start  | `Nothing here yet — create your first invoice to get started.`                     | `No data.`                                    |
| Onboarding                 | Encouraging, one step a time | `Let's set up your workspace. It takes about 2 minutes.`                           | `Please complete all the required steps.`     |
| Loading                    | Reassuring, factual          | `Loading your projects…`                                                           | `Please wait…`                                |
| Accessible name (no label) | Neutral, names the action    | `Show or hide the sidebar`                                                         | `Toggle Sidebar`                              |

---

## Grammar and mechanics

- **Sentence case everywhere**: labels, buttons, titles, menu items, accessible names. Only the first word and proper nouns take a capital.
- **Buttons start with a verb** and name the result: `Delete project`, `Send invoice`. A confirmation button repeats the verb of the question, never `Yes` or `OK`.
- **An error message says what happened, then how to fix it**, in that order.
- **Punctuation**: no period after a label, a button, a title or an accessible name; a period after a full sentence in a message or a description. `…` is one character, never three periods. At most one exclamation mark, only in a success message, never in an error.
- **Numbers** are written as numerals: `3 projects`, `2 minutes`.
- **Address the reader as "you"**; the product speaks as "we" when it did something or failed to.

---

## Word list

| Use       | Not                             | Why                                                                                    |
| --------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| `sign in` | `log in`, `login`, `log on`     | One term per action; `sign in` pairs with `sign up` and `sign out`                     |
| `email`   | `e-mail`, `E-mail`              | One spelling, so a search finds every occurrence                                       |
| `select`  | `click`, `tap`, `hit`           | Works for a mouse, a finger, a keyboard and a screen reader                            |
| `delete`  | `remove` (for a permanent loss) | `delete` destroys; `remove` takes out of a list and can be undone                      |
| `…`       | `...`                           | One character, read once by screen readers                                             |
| (nothing) | `please`, `oops`, `whoops`      | `please` turns an instruction into a favor; `oops` makes light of the reader's problem |

---

## Usage Rules

- ✅ Write every interface text in sentence case, accessible names included
- ✅ Start a button with a verb that names its result, and repeat that verb on the confirmation button of a destructive action
- ✅ Say what happened, then how to fix it, in every error message
- ✅ Use contractions and "you"; let the product say "we" when it acts or fails
- ✅ Write `…` as one character, and numbers as numerals
- ❌ Never write "please", "oops" or "whoops", and never an exclamation mark in an error
- ❌ Never blame the reader ("You entered an invalid date"): describe the problem and the fix
- ❌ Never use a term from the "Not" column of the word list

## Guard

`scripts/lint-ui-strings.ts` (`npm run index:strings`) reads every default
string in `UI_STRINGS` and fails when one is not in sentence case, contains
three periods instead of `…`, uses a word the list above rejects, or ends an
accessible name with a period or an exclamation mark. Descriptions — full
sentences read by screen readers — keep their final period. Text written by the
consuming application is not checked: it comes through the override props.
