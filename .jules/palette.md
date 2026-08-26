## 2024-08-26 - Missing ARIA Labels on Icon-only Cart Buttons
**Learning:** Icon-only buttons within the shopping cart (decrease quantity, increase quantity, remove item, and close cart) lack `aria-label` attributes, making them inaccessible to screen reader users who cannot determine the buttons' purpose or which specific item they affect.
**Action:** Always add dynamic `aria-label` attributes to icon-only buttons within mapped lists to provide context (e.g., `aria-label={"Decrease quantity of ${item.name}"}`).
