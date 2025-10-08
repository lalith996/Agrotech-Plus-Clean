import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  image?: string
  farmer?: {
    name: string
    farmName: string
  }
  unit?: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const exists = items.some((i) => i.productId === item.productId)
        
        if (!exists) {
          set({ items: [...items, item] })
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),
      getItemCount: () => get().items.length,
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
