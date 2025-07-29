/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Link } from '@/i18n/routing'
import Image from 'next/image'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Edit, Tag } from 'lucide-react'
import { IBrand } from '@/lib/db/models/brand.model'
import { deleteBrand, getAllBrandsForAdmin } from '@/lib/actions/brand.actions'

type BrandListDataProps = {
  brands: IBrand[]
  totalPages: number
  totalBrands: number
  to: number
  from: number
}

const BrandList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<BrandListDataProps>()
  const [isPending, startTransition] = useTransition()

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    if (changeType === 'next') {
      setPage(newPage)
    } else {
      setPage(newPage)
    }
    startTransition(async () => {
      const data = await getAllBrandsForAdmin({
        query: inputValue,
        page: newPage,
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as any).debounce)
      ;(window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllBrandsForAdmin({ query: value, page: 1 })
          setData(data)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllBrandsForAdmin({ query: '', page })
        setData(data)
      })
    }
  }
  
  useEffect(() => {
    startTransition(async () => {
      const data = await getAllBrandsForAdmin({ query: '' })
      setData(data)
    })
  }, [])

  return (
    <div>
      <div className='space-y-2'>
        <div className='flex-between flex-wrap gap-2'>
          <div className='flex flex-wrap items-center gap-2 '>
            <h1 className='font-bold text-lg'>Brands</h1>
            <div className='flex flex-wrap items-center  gap-2 '>
              <Input
                className='w-auto'
                type='text '
                value={inputValue}
                onChange={handleInputChange}
                placeholder='Filter name...'
              />

              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {data?.totalBrands === 0
                    ? 'No'
                    : `${data?.from}-${data?.to} of ${data?.totalBrands}`}
                  {' results'}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant='default'>
            <Link href='/admin/brands/create'>Create Brand</Link>
          </Button>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.brands.map((brand: IBrand) => (
              <Card key={brand._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      <Link href={`/admin/brands/${brand._id}`} className="hover:underline">
                        {brand.name}
                      </Link>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      ID: {formatId(brand._id)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {brand.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {brand.logo && (
                    <div className="mb-3 h-24 flex items-center justify-center bg-gray-50 rounded-md border">
                      <Image 
                        src={brand.logo} 
                        alt={brand.name} 
                        width={120} 
                        height={80}
                        className="h-20 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {brand.isFeatured && (
                      <div className="col-span-2">
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last updated: {formatDateTime(brand.updatedAt).dateTime}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-1 pt-2">
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/brands/${brand._id}`}>
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={brand._id}
                    action={deleteBrand}
                    callbackAction={() => {
                      startTransition(async () => {
                        const data = await getAllBrandsForAdmin({
                          query: inputValue,
                        })
                        setData(data)
                      })
                    }}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
          {(data?.totalPages ?? 0) > 1 && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => handlePageChange('prev')}
                disabled={Number(page) <= 1}
                className='w-24'
              >
                <ChevronLeft /> Previous
              </Button>
              Page {page} of {data?.totalPages}
              <Button
                variant='outline'
                onClick={() => handlePageChange('next')}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
                className='w-24'
              >
                Next <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrandList