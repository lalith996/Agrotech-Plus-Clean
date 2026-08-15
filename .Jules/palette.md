## 2024-07-07 - Screen reader accessibility for Cart Drawer icon buttons
**Learning:** Icon-only interactive elements in reusable components (like the cart drawer) require aria-label tags for screen readers to convey meaning, and visual indications for non-interactive states (like a disabled "decrease quantity" button) improve user confidence.
**Action:** Always verify that interactive elements with only icons include an accessible description, and provide clear styling feedback for disabled states using Tailwind classes like `disabled:opacity-50` and `disabled:cursor-not-allowed`.
