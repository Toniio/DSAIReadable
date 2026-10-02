---
"dsaireadable": patch
---

docs: The States section of the 65 component specs is generated from the code: each state lists the classes that draw it, and its description can no longer contradict them. The descriptions that did are fixed (overlays enter with `fade-in-0`, not `fade-in`; Slider, RadioGroup and Field name their ring and opacity tokens instead of px and percentage values), the states the code draws without a row are described, and rows filed under the wrong state (an open popup under `active`) moved to the right one.
