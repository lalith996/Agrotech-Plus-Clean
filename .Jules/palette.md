## 2023-10-27 - [Dynamic ARIA labels in lists]
**Learning:** When adding ARIA labels to items inside a mapped list (like a cart), using dynamic values like `aria-label={\`Decrease quantity of \${item.name}\`}` instead of a generic "Decrease quantity" is crucial for screen reader users to understand *which* item they are interacting with.
**Action:** Always check if an icon-only button is part of a list, and if so, include the item's identifying name in the `aria-label` to provide context.
