## 2024-08-05 - Missing accessibility attributes in cart drawer icon buttons
**Learning:** Found an accessibility issue pattern in the cart drawer where icon-only buttons (like Plus, Minus, Trash, and Close) were lacking descriptive ARIA labels, making the cart unusable for screen reader users. Additionally, these buttons lacked distinct visual focus indicators for keyboard navigation.
**Action:** Always verify that all icon-only buttons in interactive components have clear, descriptive `aria-label` attributes and implement `focus-visible` utility classes for keyboard accessibility.
