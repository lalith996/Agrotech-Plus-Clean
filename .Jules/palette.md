## 2024-05-18 - Missing ARIA Labels in Cart Components
**Learning:** Icon-only buttons (like `+`, `-`, and `trash` in cart components) lacked screen reader context, a common pattern to watch out for across this app's components.
**Action:** Always ensure icon-only interactive elements contain `aria-label`s describing the action and specific item affected (e.g., "Decrease quantity of Apple").
