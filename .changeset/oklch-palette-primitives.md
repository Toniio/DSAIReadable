---
"dsaireadable": minor
---

token-breaking: The color primitives are generated: one OKLCH ramp of 11 steps, `50` to `950`, per hue (mist, violet, red, green, emerald, blue, yellow, amber, plum), on lightness targets every hue shares, each step with its `hex` fallback. `tokens.css` declares them, and the elevation shadows, as `oklch()`. `primitive.color.mist.0` is renamed `primitive.color.white` (`--ds-prim-color-mist-0` to `--ds-prim-color-white`), `violet.550` and `amber.450` are removed, every other color primitive changes value, and each ramp gains the steps it lacked. The primitives stay private: no semantic or component token is renamed, and code that follows the rules reads none of them.
