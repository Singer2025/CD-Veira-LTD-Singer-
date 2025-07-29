'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { IOrder } from '@/lib/db/models/order.model'
import { cn, formatDateTime } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import { deliverOrder, updateOrderToPaid } from '@/lib/actions/order.actions'
import { MapPin, CreditCard, Package, Truck, Calendar, CheckCircle2, XCircle, Clock, ArrowRight, Info } from 'lucide-react'

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrder
  isAdmin: boolean
}) {
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
  } = order

  return (
    <div className="grid md:grid-cols-3 md:gap-6">
      <div className="overflow-x-auto md:col-span-2 space-y-6">
        {/* Order Status Timeline */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Placed</h3>
                  <p className="text-sm text-gray-500">{formatDateTime(order.createdAt!).dateTime}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-2 ${isPaid ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {isPaid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Payment {isPaid ? 'Completed' : 'Pending'}</h3>
                  {isPaid ? (
                    <p className="text-sm text-gray-500">{formatDateTime(paidAt!).dateTime}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Awaiting payment</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-2 ${isDelivered ? 'bg-green-100' : isPaid ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {isDelivered ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : isPaid ? (
                      <Truck className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isDelivered ? 'Delivered' : isPaid ? 'In Transit' : 'Delivery Pending'}
                  </h3>
                  {isDelivered ? (
                    <p className="text-sm text-gray-500">{formatDateTime(deliveredAt!).dateTime}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {isPaid ? `Expected by ${formatDateTime(expectedDeliveryDate!).dateTime}` : 'Awaiting payment'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Shipping Address */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                {shippingAddress.fullName} {shippingAddress.phone && `• ${shippingAddress.phone}`}
              </p>
              <p className="text-gray-700">
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.province}, {shippingAddress.postalCode}<br />
                {shippingAddress.country}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Method */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{paymentMethod}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {isPaid ? (
                    `Paid on ${formatDateTime(paidAt!).dateTime}`
                  ) : (
                    'Payment pending'
                  )}
                </p>
              </div>
              {isPaid ? (
                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Paid
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Fulfillment Method */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-600" />
              Fulfillment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {order.fulfillmentMethod ? (
                <div className="flex items-center gap-3">
                  {order.fulfillmentMethod === 'shipping' ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Standard Shipping</p>
                        <p className="text-sm text-gray-500">Delivery to shipping address</p>
                      </div>
                    </>
                  ) : order.fulfillmentMethod === 'pickup' ? (
                    <>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">In-Store Pickup</p>
                        <p className="text-sm text-gray-500">Pickup at store location</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Info className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Special Arrangement</p>
                        <p className="text-sm text-gray-500">Contact customer service for details</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No fulfillment method specified</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Order Items */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Order Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.slug} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/product/${item.slug}`}
                      className="flex items-center group"
                    >
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="64px"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        <ProductPrice price={item.price} plain />
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <ProductPrice price={item.price * item.quantity} plain />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Summary */}
      <div>
        <Card className="shadow-sm border border-gray-200 overflow-hidden sticky top-4">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Items ({items.length})</span>
                <span><ProductPrice price={itemsPrice} plain /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span><ProductPrice price={taxPrice} plain /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span><ProductPrice price={shippingPrice} plain /></span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span><ProductPrice price={totalPrice} plain /></span>
              </div>
            </div>
            
            {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
              <Link
                className={cn(buttonVariants(), 'w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center gap-2')}
                href={`/checkout/${order._id}`}
              >
                Pay Order <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {isAdmin && !isPaid && paymentMethod === 'Cash On Delivery' && (
              <div className="mt-4">
                <ActionButton
                  caption='Mark as paid'
                  action={() => updateOrderToPaid(order._id)}
                />
              </div>
            )}
            
            {isAdmin && isPaid && !isDelivered && (
              <div className="mt-4">
                <ActionButton
                  caption='Mark as delivered'
                  action={() => deliverOrder(order._id)}
                />
              </div>
            )}
          </CardContent>
          
          {isPaid && (
            <CardFooter className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="w-full text-center">
                <Badge className={isDelivered ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                  {isDelivered ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Delivered
                    </>
                  ) : (
                    <>
                      <Truck className="h-3.5 w-3.5 mr-1" /> In Transit
                    </>
                  )}
                </Badge>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
