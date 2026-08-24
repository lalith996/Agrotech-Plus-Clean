## 2024-08-24 - Missing ARIA Labels on Cart Controls
**Learning:** Icon-only buttons for quantity adjustments (Minus, Plus) and item removal (Trash2) within the cart drawer were missing descriptive `aria-label`s, creating an accessibility issue for screen reader users trying to manage their cart items.
**Action:** Always ensure dynamic, repeatable list items include context-specific `aria-label`s (e.g. "Decrease quantity of ${item.name}") on icon-only control buttons to maintain accessibility.
