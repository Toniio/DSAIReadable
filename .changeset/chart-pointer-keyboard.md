---
"dsaireadable": patch
---

docs: The Chart spec now says that while the pointer rests over a chart, Recharts keeps the tooltip on the hovered data point: focus shows that point, and the arrow keys and `Enter` change nothing visible until the pointer leaves the chart (recharts/recharts#7905). It also says to move the pointer off the chart before a browser test of the keyboard: a pointer an earlier test left over the chart fails the test, depending on the file order.
