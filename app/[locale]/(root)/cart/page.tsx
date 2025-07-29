'use client'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import FulfillmentOptions from '@/components/shared/product/fulfillment-options'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useRouter } from '@/i18n/routing'
import { ShoppingCart, ShoppingBag, ArrowRight, Trash2, Heart, AlertCircle } from 'lucide-react'
import React from 'react'

export default function CartPage() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore()
  const router = useRouter()
  const {
    setting: {
      site,
      common: { freeShippingMinPrice },
    },
  } = useSettingStore()

  const t = useTranslations()
  const locale = useLocale()
  
  // Calculate shipping and tax
  const shippingPrice = itemsPrice < freeShippingMinPrice ? 10 : 0
  const taxPrice = Math.round(itemsPrice * 0.15 * 100) / 100
  const totalPrice = itemsPrice + shippingPrice + taxPrice
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="h-8 w-8 text-red-600" />
        {t('Cart.Shopping Cart')}
      </h1>
      
      {items.length === 0 ? (
        <Card className="shadow-md border-2 border-gray-100 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('Cart.Your Shopping Cart is empty')}</h2>
            <p className="text-gray-500 mb-6">{t('Cart.Empty Cart Message')}</p>
            <Link href={`/${locale}/`}>
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full px-8">
                {t('Cart.Continue Shopping')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-md border-2 border-gray-100 overflow-hidden mb-6">
              <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
                <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700">
                  <div className="col-span-6 md:col-span-7">{t('Cart.Product')}</div>
                  <div className="col-span-2 text-center hidden md:block">{t('Cart.Unit Price')}</div>
                  <div className="col-span-2 text-center">{t('Cart.Quantity')}</div>
                  <div className="col-span-4 md:col-span-1 text-right">{t('Cart.Total Price')}</div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {items.map((item) => (
                  <div 
                    key={item.clientId}
                    className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    {/* Product Image and Details */}
                    <div className="col-span-6 md:col-span-7 flex gap-4">
                      <Link href={`/product/${item.slug}`} className="shrink-0">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 80px, 96px"
                            className="object-contain p-1"
                          />
                        </div>
                      </Link>
                      
                      <div className="flex flex-col justify-between py-1">
                        <Link 
                          href={`/product/${item.slug}`}
                          className="font-medium text-sm md:text-base line-clamp-2 hover:text-red-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        
                        <div className="flex flex-col md:flex-row md:gap-4 text-xs text-gray-500 mt-1">
                          {item.color && (
                            <span>
                              {t('Cart.Color')}: <span className="font-medium">{item.color}</span>
                            </span>
                          )}
                          {item.size && (
                            <span>
                              {t('Cart.Size')}: <span className="font-medium">{item.size}</span>
                            </span>
                          )}
                          
                          {/* Show fulfillment options if available */}
                          {(item.isShippable || item.isPickupAvailable) && (
                            <div className="mt-1 md:mt-0">
                              <FulfillmentOptions 
                                product={{
                                  isShippable: item.isShippable,
                                  isPickupAvailable: item.isPickupAvailable
                                }} 
                                iconSize={12} 
                                showLabels={false}
                                compact={true}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-2 md:hidden">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-gray-500 hover:text-red-600"
                            onClick={() => removeItem(item)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t('Cart.Remove')}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-gray-500 hover:text-red-600"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {t('Cart.Save for Later')}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Unit Price - Hidden on mobile */}
                    <div className="col-span-2 text-center hidden md:block">
                      <ProductPrice price={item.price} className="font-medium" />
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="col-span-2 flex justify-center">
                      <Select
                        value={item.quantity.toString()}
                        onValueChange={(value) => updateItem(item, Number(value))}
                      >
                        <SelectTrigger className="w-16 h-9 focus:ring-red-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: Math.min(10, item.countInStock) }).map((_, i) => {
                            const value = `${i + 1}`;
                            return (
                              <SelectItem key={`${item.clientId}-qty-${value}`} value={value}>
                                {i + 1}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Total Price */}
                    <div className="col-span-4 md:col-span-1 text-right">
                      <ProductPrice 
                        price={item.price * item.quantity} 
                        className="font-bold text-red-600" 
                      />
                      
                      {/* Action buttons - Desktop only */}
                      <div className="hidden md:flex md:flex-col gap-2 mt-2 text-xs">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-gray-500 hover:text-red-600"
                          onClick={() => removeItem(item)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t('Cart.Remove')}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-gray-500 hover:text-red-600"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {t('Cart.Save for Later')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              
              <CardFooter className="flex justify-between items-center py-4 px-6 bg-gray-50 border-t border-gray-200">
                <Link href={`/${locale}/`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    {t('Cart.Continue Shopping')}
                  </Button>
                </Link>
                
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {t('Cart.Subtotal')} ({items.reduce((acc, item) => acc + item.quantity, 0)} {t('Cart.items')}):{' '}
                    <span className="text-red-600 ml-1">
                      <ProductPrice price={itemsPrice} plain />
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-2 border-gray-100 overflow-hidden sticky top-24">
              <CardHeader className="pb-2 pt-4 px-6">
                <CardTitle className="text-xl font-bold">{t('Cart.Order Summary')}</CardTitle>
              </CardHeader>
              
              <CardContent className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Cart.Subtotal')}</span>
                    <span className="font-medium"><ProductPrice price={itemsPrice} plain /></span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Cart.Shipping & Handling')}</span>
                    <span className="font-medium">
                      {shippingPrice === 0 ? (
                        <span className="text-green-600 font-bold">{t('Cart.Free')}</span>
                      ) : (
                        <ProductPrice price={shippingPrice} plain />
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Cart.Tax')}</span>
                    <span className="font-medium"><ProductPrice price={taxPrice} plain /></span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="font-bold">{t('Cart.Order Total')}</span>
                    <span className="font-bold text-red-600">
                      <ProductPrice price={totalPrice} plain />
                    </span>
                  </div>
                  
                  {itemsPrice < freeShippingMinPrice && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm flex gap-2 items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        {t('Cart.Add')}{' '}
                        <span className="text-green-700 font-bold">
                          <ProductPrice price={freeShippingMinPrice - itemsPrice} plain />
                        </span>{' '}
                        {t('Cart.of eligible items to your order to qualify for FREE Shipping')}
                      </div>
                    </div>
                  )}
                  
                  {itemsPrice >= freeShippingMinPrice && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm flex gap-2 items-start">
                      <Badge className="bg-green-100 text-green-800 border-green-200 h-5">
                        {t('Cart.Free')}
                      </Badge>
                      <div className="text-green-700">
                        {t('Cart.Your order qualifies for FREE Shipping')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <Button 
                  onClick={() => router.push('/checkout')} 
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md h-12"
                >
                  {t('Cart.Secure Checkout')}
                  <ShoppingBag className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      <BrowsingHistoryList className="mt-16" />

    </div>
  )
}
