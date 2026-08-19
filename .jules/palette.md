## 2024-10-24 - Accessibility for dynamic lists
**Learning:** When adding ARIA labels to items inside a mapped list, it's critical to use dynamic values (e.g., `aria-label={"Remove ${item.name}"}`) to provide context for screen reader users regarding which specific item they are interacting with.
**Action:** Always verify if a button inside a mapped list needs dynamic context in its aria-label rather than a static one.
