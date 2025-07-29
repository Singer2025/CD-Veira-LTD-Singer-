'use client'

import React from 'react'
import { Link } from '@/i18n/routing'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash, Eye } from 'lucide-react'
import { formatDateTime, formatId } from '@/lib/utils'

interface Product {
  _id: string
  name: string
  price: number
  category: string | { name: string }
  countInStock: number
  avgRating?: number
  isPublished?: boolean
  updatedAt: string
  slug: string
}

interface ProductTableProps {
  products: Product[]
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  // Helper function to safely get category name
  const getCategoryName = (category: string | { name: string }) => {
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Uncategorized'
    }
    return category || 'Uncategorized'
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{formatId(product._id)}</TableCell>
              <TableCell>
                <Link href={`/admin/products/${product._id}`} className="hover:underline text-blue-600">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
              <TableCell>{getCategoryName(product.category)}</TableCell>
              <TableCell>
                {product.countInStock > 0 ? (
                  <span className="text-green-600">{product.countInStock}</span>
                ) : (
                  <span className="text-red-600">0</span>
                )}
              </TableCell>
              <TableCell>{product.avgRating?.toFixed(1) || 'N/A'}</TableCell>
              <TableCell>
                {product.isPublished ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Draft
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDateTime(product.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/product/${product.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/products/${product._id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProductTable