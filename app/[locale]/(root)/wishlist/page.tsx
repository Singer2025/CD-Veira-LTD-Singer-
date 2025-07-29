'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { motion } from 'framer-motion'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Icons
import { Heart, ShoppingCart, Trash2, MoveRight, AlertCircle, CheckCircle2 } from 'lucide-react'

// Custom Components
import ProductPrice from '@/components/shared/product/product-price'
import AddToCart from '@/components/shared/product/add-to-cart'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'

// Hooks and Actions
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'

// Create a new hook for wishlist functionality
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define wishlist store type
interface WishlistItem {
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

// Wishlist Page Component
export default function WishlistPage() {
  const t = useTranslations()
  const router = useRouter()
  const { items, removeItem } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()
  const { setting } = useSettingStore()
  
  const [activeTab, setActiveTab] = useState('all')
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? items 
    : activeTab === 'in-stock' 
      ? items.filter(item => item.countInStock > 0)
      : items.filter(item => item.countInStock === 0)

  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, WishlistItem[]>)

  // Handle add to cart
  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addToCart(
        {
          product: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          countInStock: item.countInStock,
          color: item.color || '',
          size: item.size || '',
          quantity: 1,
        },
        1
      )
      setNotification({
        message: t('Added to cart successfully'),
        type: 'success'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      setNotification({
        message: t('Failed to add to cart'),
        type: 'error'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('My Wishlist')}</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            {t('Home')}
          </Link>
          <MoveRight className="h-3 w-3 mx-2" />
          <span>{t('My Wishlist')}</span>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-4 p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="text-sm">
            {t('All Items')} ({items.length})
          </TabsTrigger>
          <TabsTrigger value="in-stock" className="text-sm">
            {t('In Stock')} ({items.filter(item => item.countInStock > 0).length})
          </TabsTrigger>
          <TabsTrigger value="out-of-stock" className="text-sm">
            {t('Out of Stock')} ({items.filter(item => item.countInStock === 0).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {items.length === 0 ? (
        <Card className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('Your wishlist is empty')}</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              {t('Items added to your wishlist will be saved here for you to purchase later.')}
            </p>
            <Button 
              onClick={() => router.push('./search')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors"
            >
              {t('Continue Shopping')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Render items by category */}
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
                <Link href={`./search?category=${category}`} className="text-sm text-red-600 hover:text-red-700 transition-colors">
                  {t('View all in')} {category}
                </Link>
              </div>
              <Separator className="my-4" />
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {categoryItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    exit="exit"
                    layout
                    className="group"
                  >
                    <Card className="h-full flex flex-col overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="relative pt-4 px-4">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                        
                        <Link href={`/product/${item.slug}`}>
                          <div className="relative h-48 w-full overflow-hidden rounded-md bg-gray-100 group-hover:opacity-90 transition-opacity">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-contain"
                            />
                          </div>
                        </Link>
                        
                        {item.countInStock === 0 && (
                          <Badge variant="outline" className="absolute top-2 left-2 bg-red-100 text-red-800 border-red-200">
                            {t('Out of Stock')}
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="flex-grow p-4">
                        <Link href={`/product/${item.slug}`} className="block">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        
                        <div className="mt-2 text-xs text-gray-600">
                          {item.brand}
                        </div>
                        
                        <div className="mt-2">
                          <ProductPrice price={item.price} listPrice={item.listPrice} />
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-0">
                        {item.countInStock > 0 ? (
                          <Button 
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center gap-2 transition-colors"
                          >
                            <ShoppingCart size={16} />
                            <span>{t('Add to Cart')}</span>
                          </Button>
                        ) : (
                          <Button disabled className="w-full bg-gray-300 text-gray-600 rounded-full cursor-not-allowed">
                            {t('Out of Stock')}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}
      
      {/* Browsing History */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('Recently Viewed')}</h2>
        <BrowsingHistoryList />
      </div>
    </div>
  )
}