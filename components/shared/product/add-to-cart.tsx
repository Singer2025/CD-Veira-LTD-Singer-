/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { OrderItem } from '@/types'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'

export default function AddToCart({
  item,
  minimal = false,
}: {
  item: OrderItem
  minimal?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()

  const { addItem } = useCartStore()

  //PROMPT: add quantity state
  const [quantity, setQuantity] = useState(1)

  const t = useTranslations()

  return minimal ? (
    <Button
      className='w-full flex items-center justify-center gap-2 py-3 rounded-md'
      onClick={() => {
        try {
          addItem(item, 1)
          toast({
            description: t('Product.Added to Cart'),
            action: (
              <Button
                onClick={() => {
                  router.push('/cart')
                }}
              >
                {t('Product.Go to Cart')}
              </Button>
            ),
          })
        } catch (error: any) {
          toast({
            variant: 'destructive',
            description: error.message,
          })
        }
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1"/>
        <circle cx="19" cy="21" r="1"/>
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
      </svg>
      {t('Product.Add to Cart')}
    </Button>
  ) : (
    <div className='w-full space-y-2'>
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger className=''>
          <SelectValue>
            {t('Product.Quantity')}: {quantity}
          </SelectValue>
        </SelectTrigger>
        <SelectContent position='popper'>
          {Array.from({ length: item.countInStock }).map((_, i) => {
            const value = (i + 1).toString()
            return (
              <SelectItem key={value} value={value}>
                {i + 1}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <Button
        className='rounded-full w-full'
        type='button'
        onClick={async () => {
          try {
            const itemId = await addItem(item, quantity)
            router.push(`/cart/${itemId}`)
          } catch (error: any) {
            toast({
              variant: 'destructive',
              description: error.message,
            })
          }
        }}
      >
        {t('Product.Add to Cart')}
      </Button>
      <Button
        variant='secondary'
        onClick={() => {
          try {
            addItem(item, quantity)
            router.push(`/checkout`)
          } catch (error: any) {
            toast({
              variant: 'destructive',
              description: error.message,
            })
          }
        }}
        className='w-full rounded-full '
      >
        {t('Product.Buy Now')}
      </Button>
    </div>
  )
}
