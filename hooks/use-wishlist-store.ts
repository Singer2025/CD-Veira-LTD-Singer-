import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define wishlist item type
export interface WishlistItem {
  id: string
  name: string
  slug: string
  image: string
  price: number
  listPrice?: number
  brand: string
  category: string
  countInStock: number
  color?: string
  size?: string
  addedAt: Date
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (itemId: string) => void
  clearWishlist: () => void
  isInWishlist: (itemId: string) => boolean
}

// Create wishlist store
const useWishlistStore = create(
  persist<WishlistState>(
    (set, get) => ({
      items: [],
      addItem: (item: WishlistItem) => {
        const { items } = get()
        const existItem = items.find((x) => x.id === item.id)
        if (!existItem) {
          set({ items: [...items, { ...item, addedAt: new Date() }] })
        }
      },
      removeItem: (itemId: string) => {
        const { items } = get()
        set({ items: items.filter((x) => x.id !== itemId) })
      },
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (itemId: string) => {
        const { items } = get()
        return items.some((x) => x.id === itemId)
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

export default useWishlistStore