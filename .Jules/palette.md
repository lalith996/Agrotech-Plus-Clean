## 2026-07-17 - Missing ARIA labels in cart components
**Learning:** Interactive components like cart drawers often rely heavily on icon-only buttons (close, add/remove, delete). In this project, `lucide-react` icons are used without accompanying screen-reader text on their parent buttons, making the cart difficult to use for visually impaired users.
**Action:** Ensure all icon-only buttons inside dynamic components (like modals or drawers) have descriptive `aria-label` attributes to make the functionality explicit for assistive technologies.
