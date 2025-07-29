import { NextRequest, NextResponse } from 'next/server'

import Product from '@/lib/db/models/product.model'
import { connectToDatabase } from '@/lib/db'
import { convertToFrontendProduct } from '@/types/product'

export const GET = async (request: NextRequest) => {
  const listType = request.nextUrl.searchParams.get('type') || 'history'
  const productIdsParam = request.nextUrl.searchParams.get('ids')
  const categoriesParam = request.nextUrl.searchParams.get('categories')

  if (!productIdsParam) {
    return NextResponse.json([])
  }

  const productIds = productIdsParam.split(',').filter(id => id && id.trim() !== '')
  
  // If no valid product IDs, return empty array
  if (productIds.length === 0) {
    return NextResponse.json([])
  }
  
  // Parse categories, filtering out empty or invalid values
  const categories = categoriesParam ? 
    categoriesParam.split(',').filter(cat => cat && cat.trim() !== '' && cat !== '[object Object]') : 
    []
  
  const filter =
    listType === 'history'
      ? {
          _id: { $in: productIds },
        }
      : categories.length > 0 
        ? { category: { $in: categories }, _id: { $nin: productIds } }
        : { _id: { $nin: productIds } } // Fallback if no valid categories

  await connectToDatabase()
  const products = await Product.find(filter)
  // Convert database products to frontend products
  const frontendProducts = products.map(product => convertToFrontendProduct(product))
  
  if (listType === 'history') {
    return NextResponse.json(
      frontendProducts.sort(
        (a, b) =>
          productIds.indexOf(a.id) -
          productIds.indexOf(b.id)
      )
    )
  }
  return NextResponse.json(frontendProducts)
}
