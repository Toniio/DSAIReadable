---
"dsaireadable": patch
---

visual: DropdownMenu, ContextMenu and Menubar: an item, label, sub-trigger or checkbox or radio item with `inset={false}` no longer takes the inset left padding (`pl-7`, Menubar `pl-8`). React wrote `data-inset="false"`, which the presence selector `data-inset:` matched; the attribute is now left out when `inset` is false, so `inset={false}` and no `inset` draw the same.
