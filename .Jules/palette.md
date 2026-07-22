## 2024-07-22 - Missing ARIA Labels on Cart Drawer Icon Buttons
**Learning:** Icon-only buttons in the cart drawer (Close, Minus, Plus, Trash/Remove) were missing `aria-label` attributes, making them inaccessible to screen readers. This is a common pattern for dynamic elements like modals and drawers in this app.
**Action:** Always add `aria-label` to icon-only buttons, especially in dynamic UI components like drawers and modals, to ensure accessibility.
