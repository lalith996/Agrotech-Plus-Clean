## 2024-08-14 - Contextual ARIA Labels in Lists
**Learning:** When adding ARIA labels to items inside a mapped list (like a shopping cart), using static text like 'Increase quantity' is insufficient for screen reader users who need context on *which* item they are modifying.
**Action:** Always use dynamic values (e.g., `aria-label={`Decrease quantity of ${item.name}`}`) when adding ARIA labels inside mapped loops to ensure full contextual accessibility.
