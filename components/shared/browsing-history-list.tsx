'use client'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import React, { useEffect } from 'react'
import ProductSlider from './product/product-slider'
import { useTranslations } from 'next-intl'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'

export default function BrowsingHistoryList({
  className,
}: {
  className?: string
}) {
  const { products } = useBrowsingHistory()
  const t = useTranslations('Home')
  return (
    products.length !== 0 && (
      <div className='bg-background'>
        <Separator className={cn('mb-4', className)} />
        <ProductList
          title={t("Related to items that you've viewed")}
          type='related'
        />
        <Separator className='mb-4' />
        <ProductList
          title={t('Your browsing history')}
          hideDetails
          type='history'
        />
      </div>
    )
  )
}

function ProductList({
  title,
  type = 'history',
  hideDetails = false,
  excludeId = '',
}: {
  title: string
  type: 'history' | 'related'
  excludeId?: string
  hideDetails?: boolean
}) {
  const { products } = useBrowsingHistory()
  const [data, setData] = React.useState([])
  useEffect(() => {
    const fetchProducts = async () => {
      // Only proceed if we have products
      if (!products || products.length === 0) {
        setData([]);
        return;
      }

      // Extract valid categories and product IDs
      const validCategories = products
        .map((product) => product.category?.toString()) // Ensure category is treated as string
        .filter(catId => typeof catId === 'string' && catId.length > 0 && catId !== '[object Object]'); // Explicitly filter out "[object Object]"
      
      const validProductIds = products
        .map((product) => product.id)
        .filter(id => id); // Filter out any undefined/null/empty IDs
      
      // Only proceed if we have valid product IDs
      if (validProductIds.length === 0) {
        setData([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/products/browsing-history?type=${type}&excludeId=${excludeId}&categories=${validCategories.join(',')}&ids=${validProductIds.join(',')}`
        )
        if (res.ok) {
          const data = await res.json()
          setData(data)
        } else {
          console.error('Failed to fetch browsing history:', res.status)
          setData([])
        }
      } catch (error) {
        console.error('Error fetching browsing history:', error)
        setData([])
      }
    }
    fetchProducts()
  }, [excludeId, products, type])

  return (
    data.length > 0 && (
      <ProductSlider title={title} products={data} hideDetails={hideDetails} />
    )
  )
}
