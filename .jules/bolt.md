## 2025-08-03 - Debouncing React Search Input
**Learning:** Added a local debounced state combined with useEffect and setTimeout to manage API calls on a user searching via an input form, instead of performing a direct fetch call on each keystroke or using an external hook library. We successfully minimized API re-renders.
**Action:** Apply this lightweight debouncing pattern when dealing with text inputs that directly trigger API calls to optimize search-as-you-type performance.
