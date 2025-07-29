'use client'

import * as React from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Star, Package, Tag, Truck, Eye, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime, formatId } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import { deleteProduct } from '@/lib/actions/product.actions'

// Define the product data structure
export type ProductColumn = {
  _id: string
  name: string
  slug: string
  images: string[]
  price: number
  listPrice?: number
  countInStock: number
  category: any
  brand: any
  isPublished: boolean
  avgRating: number
  numReviews: number
  createdAt: string
  updatedAt: string
  modelNumber?: string
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'images',
    header: 'Image',
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const [hasError, setHasError] = React.useState(false)
      
      // Validate image URL
      const isValidImage = (url: string) => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      }
      
      const imageUrl = images && images.length > 0 ? images[0] : ''
      const validImage = imageUrl && isValidImage(imageUrl)
      
      return (
        <div className="relative h-16 w-16 bg-white border rounded-md overflow-hidden">
          {validImage && !hasError ? (
            <Image 
              src={imageUrl} 
              alt={row.getValue('name') as string || 'Product image'}
              fill
              className='object-contain p-1'
              onError={() => setHasError(true)}
              unoptimized
            />
          ) : (
            <div className='flex items-center justify-center h-full text-gray-400'>
              <Package className="h-8 w-8 opacity-20" />
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold"
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <div className="font-medium">
            <Link href={`/admin/products/${row.original._id}`} className="hover:text-orange-600">
              {row.getValue('name')}
            </Link>
          </div>
          <div className="text-xs text-gray-500">ID: {formatId(row.original._id)}</div>
          {row.original.modelNumber && (
            <div className="text-xs text-gray-500">Model: {row.original.modelNumber}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold text-right w-full"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      const listPrice = row.original.listPrice
      
      return (
        <div className="text-right space-y-1">
          <div className="font-bold text-orange-600">${price ? price.toFixed(2) : '0.00'}</div>
          {listPrice && price && listPrice > price && (
            <div>
              <div className="text-xs text-gray-500 line-through">${listPrice.toFixed(2)}</div>
              <div className="text-xs text-green-600">Save ${(listPrice - price).toFixed(2)}</div>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category')
      return (
        <Badge variant='outline' className='bg-orange-50 text-orange-800 border-orange-200'>
          <Tag className="h-3 w-3 mr-1" /> 
          {category && typeof category === 'object' ? (
            <>
              {category.parent && typeof category.parent === 'object' && category.parent.name ? 
                <span className="opacity-70">{category.parent.name} / </span> : 
                row.original.mainCategory && typeof row.original.mainCategory === 'object' && row.original.mainCategory.name ? 
                <span className="opacity-70">{row.original.mainCategory.name} / </span> : 
                ''
              }
              {category.name}
            </>
          ) : (category || 'Uncategorized')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
    cell: ({ row }) => {
      const brand = row.getValue('brand')
      return (
        <Badge variant='outline' className='bg-blue-50 text-blue-800 border-blue-200'>
          {typeof brand === 'object' && brand?.name ? brand.name : brand || 'Unknown'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'countInStock',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = parseInt(row.getValue('countInStock'))
      
      if (stock <= 0) {
        return (
          <Badge variant='destructive' className='bg-red-100 text-red-800 border border-red-200'>
            <Truck className="h-3 w-3 mr-1" /> Out of Stock
          </Badge>
        )
      } else if (stock <= 5) {
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border border-yellow-200'>
            <Truck className="h-3 w-3 mr-1" /> Low: {stock}
          </Badge>
        )
      } else {
        return (
          <Badge variant='outline' className='bg-green-100 text-green-800 border border-green-200'>
            <Truck className="h-3 w-3 mr-1" /> In Stock: {stock}
          </Badge>
        )
      }
    },
  },
  {
    accessorKey: 'isPublished',
    header: 'Status',
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished')
      
      return isPublished ? (
        <Badge variant='outline' className='bg-green-100 text-green-800 border border-green-200'>
          Published
        </Badge>
      ) : (
        <Badge variant='secondary' className='bg-gray-200 text-gray-700'>
          Draft
        </Badge>
      )
    },
  },
  {
    accessorKey: 'avgRating',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold"
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rating = parseFloat(row.getValue('avgRating'))
      const reviews = row.original.numReviews
      
      return (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          <span>{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
          {reviews > 0 && <span className="text-xs text-gray-500 ml-1">({reviews})</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold"
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-sm">{formatDateTime(row.getValue('updatedAt')).dateTime}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product._id}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/product/${product.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <DeleteDialog
                id={product._id}
                action={deleteProduct}
                trigger={<div className="flex items-center"><Trash2 className="mr-2 h-4 w-4" /> Delete</div>}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]