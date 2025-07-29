import { notFound } from 'next/navigation'
import React from 'react'

import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { getOrderById } from '@/lib/actions/order.actions'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import { Link } from '@/i18n/routing'
import { formatId } from '@/lib/utils'
import { ChevronRight, Package } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  return {
    title: `Order ${formatId(params.id)}`,
  }
}

export default async function OrderDetailsPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params

  const { id } = params

  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await getServerSession(authOptions)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/account" className="hover:text-red-600 transition-colors">
          Your Account
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/account/orders" className="hover:text-red-600 transition-colors">
          Your Orders
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-700 font-medium">Order {formatId(order._id)}</span>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8 text-red-600" />
          Order {formatId(order._id)}
        </h1>
        <Link href="/account/orders">
          <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Orders
          </button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <OrderDetailsForm
          order={order}
          isAdmin={session?.user?.role === 'Admin' || false}
        />
      </div>
      
      <Separator className="my-8" />
    </div>
  )
}
