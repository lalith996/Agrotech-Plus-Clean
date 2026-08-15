
## 2026-07-10 - Missing ARIA Labels in Dynamic Components
**Learning:** Icon-only buttons inside dynamically generated components (like shopping carts mapping over items) frequently miss `aria-label` attributes, rendering the controls inaccessible to screen readers.
**Action:** When creating or reviewing components with iterative or dynamic lists containing icon actions, explicitly ensure that interactive elements have descriptive `aria-label`s.
