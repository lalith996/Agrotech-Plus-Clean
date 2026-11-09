## 2024-05-14 - Missing ARIA Labels on Icon Buttons in Cart Drawer
**Learning:** Icon-only buttons (like `+`, `-`, and delete in a shopping cart) frequently lack `aria-label`s, making it difficult for screen reader users to understand their purpose. Context-specific ARIA labels (e.g., "Decrease quantity of Apple") significantly improve usability.
**Action:** When working on interactive list items (like a shopping cart), always ensure actions on specific items include the item's name in their `aria-label` to provide clear context for screen reader users.
