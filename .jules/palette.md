## 2024-11-20 - Accessible Dynamic Quantities
**Learning:** For interactive UI components with dynamic text like quantity counters, ARIA labels on control buttons are not enough; the text node itself needs `aria-live="polite"` to ensure screen readers automatically announce changes when the value updates without a full page reload or focus shift.
**Action:** Always add `aria-live="polite"` to spans or divs holding dynamic numeric values alongside the ARIA labels on the increment/decrement buttons.
