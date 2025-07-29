'use client'

import React from 'react'
import { IProduct } from '@/lib/db/models/product.model'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Ruler, Zap, Shield } from 'lucide-react'

interface ProductSpecificationsProps {
  product: IProduct
  hasSpecifications: boolean
}

export default function ProductSpecifications({ product, hasSpecifications }: ProductSpecificationsProps) {
  const t = useTranslations()

  return (
    <div className="space-y-8">
      {/* Specification Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Specifications Card */}
        {(product.dimensions || product.weight) && (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">{t('Product.Dimensions & Weight')}</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              {product.dimensions && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{t('Product.Overall Dimensions')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.dimensions.height} × {product.dimensions.width} × {product.dimensions.depth} {product.dimensions.unit}
                  </p>
                </div>
              )}
              
              {product.weight && (
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm text-gray-600">{t('Product.Weight')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.weight.value} {product.weight.unit}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Materials Card */}
        {(product.material || product.finish) && (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">{t('Product.MaterialsAndFinish')}</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              {product.material && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{t('Product.Material')}</p>
                  <p className="text-sm font-medium text-gray-900">{product.material}</p>
                </div>
              )}
              
              {product.finish && (
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm text-gray-600">{t('Product.Finish')}</p>
                  <p className="text-sm font-medium text-gray-900">{product.finish}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Energy & Performance Card */}
        {(product.energyRating || product.energyConsumption || product.capacity) && (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">{t('Product.Energy & Performance')}</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              {product.energyRating && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{t('Product.Energy Rating')}</p>
                  <p className="text-sm font-medium text-gray-900">{product.energyRating}</p>
                </div>
              )}
              
              {product.energyConsumption && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{t('Product.Energy Consumption')}</p>
                  <p className="text-sm font-medium text-gray-900">{product.energyConsumption}</p>
                </div>
              )}
              
              {product.capacity && (
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm text-gray-600">{t('Product.Capacity')}</p>
                  <p className="text-sm font-medium text-gray-900">{product.capacity}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Warranty & Installation Card */}
        {(product.warrantyDetails || product.installationRequired !== undefined) && (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">{t('Product.Warranty & Installation')}</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              {product.warrantyDetails && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{t('Product.Warranty')}</p>
                  <p className="text-sm font-medium text-gray-900">{product.warrantyDetails}</p>
                </div>
              )}
              
              {product.installationRequired !== undefined && (
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm text-gray-600">{t('Product.Installation Required')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.installationRequired ? t('Product.Yes') : t('Product.No')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Product Details */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">{t('Product.Product Specifications')}</h3>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Category */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">{t('Product.Category')}</p>
              <p className="text-sm font-medium text-gray-900">
                {typeof product.category === 'object' && product.category?.name 
                  ? product.category.name 
                  : product.category?.toString() || 'N/A'}
              </p>
            </div>
            
            {/* Brand */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">{t('Product.Brand')}</p>
              <p className="text-sm font-medium text-gray-900">
                {typeof product.brand === 'object' && product.brand?.name 
                  ? product.brand.name 
                  : product.brand?.toString() || 'N/A'}
              </p>
            </div>
            
            {/* Model Number */}
            {product.modelNumber && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">{t('Product.Model Number')}</p>
                <p className="text-sm font-medium text-gray-900">{product.modelNumber}</p>
              </div>
            )}
            
            {/* Shipping Options */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">{t('Product.Shipping')}</p>
              <p className="text-sm font-medium text-gray-900">
                {product.isShippable ? t('Product.Shipping Available') : ''}
                {product.isShippable && product.isPickupAvailable ? ' / ' : ''}
                {product.isPickupAvailable ? t('Product.In-Store Pickup Available') : ''}
                {!product.isShippable && !product.isPickupAvailable ? t('Product.Contact for Delivery Options') : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Technical Specifications */}
      {hasSpecifications && (
        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">{t('Product.Technical Specifications')}</h3>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{spec.title}</p>
                  <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}