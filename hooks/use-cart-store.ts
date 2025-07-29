import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions'

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  shippingPrice: undefined,
  totalPrice: 0,
  paymentMethod: undefined,
  fulfillmentMethod: 'shipping',
  pickupLocation: undefined,
  shippingAddress: undefined,
  deliveryDateIndex: undefined,
}

interface CartState {
  cart: Cart
  addItem: (item: OrderItem, quantity: number) => Promise<string>
  updateItem: (item: OrderItem, quantity: number) => Promise<void>
  removeItem: (item: OrderItem) => void
  clearCart: () => void
  setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>
  setPaymentMethod: (paymentMethod: string) => void
  setFulfillmentMethod: (fulfillmentMethod: string) => void
  setDeliveryDateIndex: (index: number) => Promise<void>
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )

        if (existItem) {
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error('Not enough items in stock')
          }
        } else {
          if (item.countInStock < item.quantity) {
            throw new Error('Not enough items in stock')
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }]

        // Generate deterministic clientId using product ID + color + size + a unique suffix
        const clientId = item.clientId || `${item.product}_${item.color}_${item.size}_${Date.now()}`
        
        const itemsWithIds = updatedCartItems.map(x => ({
          ...x,
          clientId: x.clientId || `${x.product}_${x.color}_${x.size}_${Date.now()}`
        }))
        
        // Check if any items are large appliances
        const hasLargeAppliances = itemsWithIds.some(item => item.isLargeAppliance)

        set({
          cart: {
            ...get().cart,
            items: itemsWithIds,
            hasLargeAppliances,
            ...(await calcDeliveryDateAndPrice({
              items: itemsWithIds,
              shippingAddress,
            })),
          },
        })
        
        const foundItem = itemsWithIds.find(
          (x) => x.clientId === clientId
        )
        if (!foundItem) {
          throw new Error(`Item not found in cart: ${clientId}`)
        }
        return clientId
      },
      updateItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart
        const exist = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )
        if (!exist) return
        const updatedCartItems = items.map((x) =>
          x.product === item.product &&
          x.color === item.color &&
          x.size === item.size
            ? { ...exist, quantity: quantity }
            : x
        )
        
        // Check if any items are large appliances
        const hasLargeAppliances = updatedCartItems.some(item => item.isLargeAppliance)
        
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            hasLargeAppliances,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        })
      },
      removeItem: async (item: OrderItem) => {
        const { items, shippingAddress } = get().cart
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        )
        
        // Check if any items are large appliances
        const hasLargeAppliances = updatedCartItems.some(item => item.isLargeAppliance)
        
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            hasLargeAppliances,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        })
      },
      setShippingAddress: async (shippingAddress: ShippingAddress) => {
        const { items } = get().cart
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
            })),
          },
        })
      },
      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        })
      },
      setFulfillmentMethod: (fulfillmentMethod: string) => {
        // If fulfillment method is pickup, set shipping price to 0
        const shippingPrice = fulfillmentMethod === 'pickup' ? 0 : get().cart.shippingPrice;
        const totalPrice = fulfillmentMethod === 'pickup' 
          ? (get().cart.totalPrice - (get().cart.shippingPrice || 0)) 
          : get().cart.totalPrice;
          
        set({
          cart: {
            ...get().cart,
            fulfillmentMethod,
            pickupLocation: fulfillmentMethod === 'pickup' ? 'Main Store' : undefined,
            shippingPrice,
            totalPrice,
          },
        })
      },
      setDeliveryDateIndex: async (index: number) => {
        const { items, shippingAddress } = get().cart

        set({
          cart: {
            ...get().cart,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
              deliveryDateIndex: index,
            })),
          },
        })
      },
      clearCart: () => {
        set({
          cart: {
            ...get().cart,
            items: [],
          },
        })
      },
      init: () => set({ cart: initialState }),
    }),

    {
      name: 'cart-store',
    }
  )
)
export default useCartStore
