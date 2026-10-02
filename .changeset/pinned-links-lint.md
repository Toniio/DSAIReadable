---
"dsaireadable": patch
---

lint: The documentation link of every rule of `@dsaireadable/eslint-plugin` (`meta.docs.url`, shown by editors and by `eslint --format`) points to the README of the plugin version installed, `blob/vX.Y.Z/packages/eslint-plugin/README.md#<rule>`, not to `main`, which can describe rules the installed version does not have; the plugin reads its own version at run time and exposes it as `meta.version`.
