## 2024-08-07 - Add missing aria-labels for icon-only buttons
**Learning:** Found multiple instances where `size="icon"` buttons in `components` and `pages` use only SVG icons but omit the `aria-label` attribute, hurting screen reader accessibility. Since Palette's goal is small UX/a11y wins, this is a prime target.
**Action:** Always verify icon-only buttons (`size="icon"`) include `aria-label` or equivalent accessible text for screen readers.
