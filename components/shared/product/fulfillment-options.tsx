'use client'

import { IProduct } from '@/lib/db/models/product.model'
import { useTranslations } from 'next-intl'
import { Truck, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface FulfillmentOptionsProps {
  product: IProduct | {
    isShippable?: boolean
    isPickupAvailable?: boolean
  }
  className?: string
  iconSize?: number
  showLabels?: boolean
  compact?: boolean
  showAsBadges?: boolean
  highlightPrimary?: boolean
}

export default function FulfillmentOptions({
  product,
  className,
  iconSize = 16,
  showLabels = true,
  compact = false,
  showAsBadges = false,
  highlightPrimary = false
}: FulfillmentOptionsProps) {
  const t = useTranslations()
  
  // Ensure we have boolean values for fulfillment options
  const isShippable = product.isShippable === true
  const isPickupAvailable = product.isPickupAvailable === true
  
  // Determine if any fulfillment options are available
  const hasAnyOption = isShippable || isPickupAvailable
  
  // Pre-calculate icon size to avoid template literal in className
  const calculatedIconSize = Math.floor(iconSize/4)
  
  if (showAsBadges) {
    return (
      <div className={cn(
        'flex gap-2',
        compact ? 'flex-row items-center' : 'flex-wrap',
        className
      )}>
        {product.isShippable && (
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-green-200 bg-green-50">
            <Truck className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-700 text-xs font-medium">{t('Product.Shipping Available')}</span>
          </Badge>
        )}
        
        {product.isPickupAvailable && (
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-blue-200 bg-blue-50">
            <Package className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-blue-700 text-xs font-medium">{t('Product.In-Store Pickup Available')}</span>
          </Badge>
        )}
        
        {!hasAnyOption && (
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700 text-xs font-medium">{t('Product.Contact for Delivery Options')}</span>
          </Badge>
        )}
      </div>
    )
  }
  
  return (
    <div className={cn(
      'flex flex-col gap-2',
      compact ? 'flex-row items-center gap-4' : '',
      className
    )}>
      {product.isShippable && (
        <div className={cn(
          "flex items-center space-x-2 text-sm",
          highlightPrimary ? "text-green-700 font-medium" : "text-gray-600"
        )}>
          {highlightPrimary ? 
            <CheckCircle className={`h-${calculatedIconSize} w-${calculatedIconSize} text-green-600`} /> :
            <Truck className={`h-${calculatedIconSize} w-${calculatedIconSize} text-green-600`} />
          }
          {showLabels && <span>{t('Product.Shipping Available')}</span>}
        </div>
      )}
      
      {product.isPickupAvailable && (
        <div className={cn(
          "flex items-center space-x-2 text-sm",
          highlightPrimary && !product.isShippable ? "text-blue-700 font-medium" : "text-gray-600"
        )}>
          {highlightPrimary && !product.isShippable ? 
            <CheckCircle className={`h-${calculatedIconSize} w-${calculatedIconSize} text-blue-600`} /> :
            <Package className={`h-${calculatedIconSize} w-${calculatedIconSize} text-blue-600`} />
          }
          {showLabels && <span>{t('Product.In-Store Pickup Available')}</span>}
        </div>
      )}
      
      {!hasAnyOption && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <AlertCircle className={`h-${calculatedIconSize} w-${calculatedIconSize}`} />
          {showLabels && <span>{t('Product.Contact for Delivery Options')}</span>}
        </div>
      )}
    </div>
  )
}