import { Metadata } from 'next'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { getLocale } from 'next-intl/server'

import Pagination from '@/components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getMyOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { formatDateTime, formatId } from '@/lib/utils'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, ShoppingBag, Calendar, CreditCard, Truck, Eye } from 'lucide-react'

const PAGE_TITLE = 'Your Orders'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const locale = await getLocale()
  const orders = await getMyOrders({
    page,
  })

  // Helper function to determine order status badge
  const getOrderStatusBadge = (order: IOrder) => {
    if (order.isDelivered) {
      return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Delivered</Badge>
    } else if (order.isPaid) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Paid</Badge>
    } else {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">Processing</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/account" className="hover:text-red-600 transition-colors">
          Your Account
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-700 font-medium">{PAGE_TITLE}</span>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-red-600" />
          {PAGE_TITLE}
        </h1>
        <Link href="/">
          <Button variant="outline" className="rounded-full">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {orders.data.length === 0 ? (
        <Card className="shadow-md border-2 border-gray-100 overflow-hidden mb-8">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You have no orders yet</h2>
            <p className="text-gray-500 mb-6">Items you order will appear here</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full px-8">
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 mb-8">
          {orders.data.map((order: IOrder) => (
            <Card key={order._id} className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Order #:</span>
                      <Link href={`/account/orders/${order._id}`} className="font-medium text-red-600 hover:underline">
                        {formatId(order._id)}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {formatDateTime(order.createdAt!).dateTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getOrderStatusBadge(order)}
                    <div className="font-bold text-lg">
                      <ProductPrice price={order.totalPrice} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Payment Status</h3>
                      <div className="flex items-center gap-2">
                        {order.isPaid ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">Paid</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-amber-600 font-medium">Pending</span>
                          </>
                        )}
                      </div>
                      {order.isPaid && order.paidAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(order.paidAt).dateTime}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Delivery Status</h3>
                      <div className="flex items-center gap-2">
                        {order.isDelivered ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">Delivered</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-600 font-medium">In Transit</span>
                          </>
                        )}
                      </div>
                      {order.isDelivered && order.deliveredAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(order.deliveredAt).dateTime}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Order Summary</h3>
                      <p className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
                <Link href={`/account/orders/${order._id}`}>
                  <Button variant="outline" className="rounded-full flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Order Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          
          {orders.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination page={page} totalPages={orders.totalPages} />
            </div>
          )}
        </div>
      )}
      
      <Separator className="my-8" />
      
      <BrowsingHistoryList className="mt-8" />
    </div>
  )
}
