import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type BrowsingHistory = {
  products: { id: string; category: string }[]
}
const initialState: BrowsingHistory = {
  products: [],
}

export const browsingHistoryStore = create<
  BrowsingHistory & {
    addItem: (product: { id: string; category: string }) => void
    clear: () => void
  }
>()(
  persist(
    (set) => ({
      ...initialState,
      addItem: (product) => 
        set((state) => {
          const products = [...state.products];
          const index = products.findIndex((p) => p.id === product.id);
          if (index !== -1) products.splice(index, 1);
          products.unshift(product);
          if (products.length > 10) products.pop();
          return { products };
        }),
      clear: () => set(initialState)
    }),
    {
      name: 'browsingHistoryStore',
    }
  )
)

export default function useBrowsingHistory() {
  return {
    products: browsingHistoryStore((state) => state.products),
    addItem: browsingHistoryStore((state) => state.addItem),
    clear: browsingHistoryStore((state) => state.clear),
  }
}
