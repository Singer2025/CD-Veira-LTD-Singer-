'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Box, Package, Truck } from 'lucide-react';

interface DeliveryMethod {
  id: string;
  name: string;
  description?: string;
  icon: string;
  price?: number;
  estimatedDays?: string;
  isDefault?: boolean;
}

interface DeliveryPickupOptionsProps {
  product: {
    _id: string;
    deliveryMethods?: DeliveryMethod[];
    isShippable?: boolean;
    isPickupAvailable?: boolean;
  };
}

const DeliveryPickupOptions = ({ product }: DeliveryPickupOptionsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const t = useTranslations('Product');
  
  // Check if we have new delivery methods
  const hasDeliveryMethods = product.deliveryMethods && product.deliveryMethods.length > 0;
  
  // Legacy options as fallback
  const hasDelivery = product.isShippable !== false;
  const hasPickup = product.isPickupAvailable !== false;
  
  // Set the default selected method when component mounts
  useEffect(() => {
    if (hasDeliveryMethods) {
      // Find default method or use the first one
      const defaultMethod = product.deliveryMethods.find(m => m.isDefault) || product.deliveryMethods[0];
      setSelectedMethod(defaultMethod.id);
    } else if (hasDelivery) {
      setSelectedMethod('delivery');
    } else if (hasPickup) {
      setSelectedMethod('pickup');
    }
  }, [product.deliveryMethods, hasDelivery, hasPickup, hasDeliveryMethods]);
  
  // If we have new delivery methods, use those
  if (hasDeliveryMethods) {
    const multipleOptions = product.deliveryMethods.length > 1;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">{t('Delivery Options')}</h3>
        <div className="space-y-3">
          {multipleOptions ? (
            // Multiple options - show as selectable radio buttons
            product.deliveryMethods.map((method) => (
              <label 
                key={method.id} 
                className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg border ${selectedMethod === method.id ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-100'} cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors`}
              >
                <input 
                  type="radio" 
                  name="deliveryMethod" 
                  value={method.id} 
                  className="mt-1" 
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
                {method.icon === 'truck' ? (
                  <Truck className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                ) : method.icon === 'package' ? (
                  <Package className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Box className="h-6 w-6 text-gray-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  {method.description && (
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  )}
                  {method.estimatedDays && (
                    <p className="text-sm text-gray-600">{method.estimatedDays}</p>
                  )}
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {method.price && method.price > 0 ? `$${method.price.toFixed(2)}` : t('FREE')}
                  </p>
                </div>
              </label>
            ))
          ) : (
            // Single option - show as non-selectable info card
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              {product.deliveryMethods[0].icon === 'truck' ? (
                <Truck className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
              ) : product.deliveryMethods[0].icon === 'package' ? (
                <Package className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Box className="h-6 w-6 text-gray-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{product.deliveryMethods[0].name}</h4>
                {product.deliveryMethods[0].description && (
                  <p className="text-sm text-gray-600 mt-1">{product.deliveryMethods[0].description}</p>
                )}
                {product.deliveryMethods[0].estimatedDays && (
                  <p className="text-sm text-gray-600">{product.deliveryMethods[0].estimatedDays}</p>
                )}
                <p className="text-sm font-medium text-green-600 mt-1">
                  {product.deliveryMethods[0].price && product.deliveryMethods[0].price > 0 
                    ? `$${product.deliveryMethods[0].price.toFixed(2)}` 
                    : t('FREE')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Fallback to legacy options
  // If both options are available, make them selectable
  if (hasDelivery && hasPickup) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">{t('Delivery & Pickup Options')}</h3>
        <div className="space-y-3">
          {/* Delivery Option - Selectable */}
          <label className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg border ${selectedMethod === 'delivery' ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-100'} cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors`}>
            <input 
              type="radio" 
              name="fulfillment" 
              value="delivery" 
              className="mt-1" 
              checked={selectedMethod === 'delivery'}
              onChange={() => setSelectedMethod('delivery')}
            />
            <Truck className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{t('Standard Delivery')}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('Free delivery within 3-5 business days')}
              </p>
              <p className="text-sm font-medium text-green-600 mt-1">{t('FREE')}</p>
            </div>
          </label>
          
          {/* Store Pickup Option - Selectable */}
          <label className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg border ${selectedMethod === 'pickup' ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-100'} cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors`}>
            <input 
              type="radio" 
              name="fulfillment" 
              value="pickup" 
              className="mt-1" 
              checked={selectedMethod === 'pickup'}
              onChange={() => setSelectedMethod('pickup')}
            />
            <Package className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{t('Store Pickup')}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('Available at select locations - ready in 1 hour')}
              </p>
              <p className="text-sm font-medium text-blue-600 mt-1">{t('FREE')}</p>
            </div>
          </label>
        </div>
      </div>
    );
  }
  
  // If only one option is available, show it as a non-selectable info card
  if (hasDelivery || hasPickup) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">{t('Availability')}</h3>
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {hasDelivery ? (
            <>
              <Truck className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">{t('Standard Delivery')}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t('Free delivery within 3-5 business days')}
                </p>
                <p className="text-sm font-medium text-green-600 mt-1">{t('FREE')}</p>
              </div>
            </>
          ) : (
            <>
              <Package className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">{t('Store Pickup')}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t('Available at select locations - ready in 1 hour')}
                </p>
                <p className="text-sm font-medium text-blue-600 mt-1">{t('FREE')}</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // If no options are available
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">{t('Availability')}</h3>
      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
        <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-gray-900">{t('Currently Unavailable')}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {t('This item is not available for delivery or pickup at this time')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPickupOptions;