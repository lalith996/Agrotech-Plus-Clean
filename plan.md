1. **Add `aria-label` to the remove from wishlist button in `pages/wishlist.tsx`**
   - The `<button>` at line 160 only contains a `<Heart>` icon and is used to remove an item from the wishlist. It needs an `aria-label="Remove ${item.name} from wishlist"`.
2. **Add `aria-label` to the fullscreen image button in `pages/products/[id].tsx`**
   - The `<button>` at line 315 only contains a `<Maximize2>` icon. It needs an `aria-label="View fullscreen gallery"`.
3. **Add `aria-label` to the close fullscreen gallery button in `pages/products/[id].tsx`**
   - The `<button>` at line 775 only contains a `<X>` icon. It needs an `aria-label="Close fullscreen gallery"`.
4. **Add `aria-label` to language selector in `components/layout/header.tsx`**
   - The `<button>` at line 83 only shows text on small screens, so it needs `aria-label="Select language"`.
5. **Add entry to `.Jules/palette.md` about icon-only buttons**
   - Document the learning about icon-only buttons missing `aria-label` across various components (wishlist, gallery, header).
6. **Verify formatting and testing**
   - Run `npx eslint` for the changed files.
   - Re-install packages if needed and run tests (`pnpm test`).
