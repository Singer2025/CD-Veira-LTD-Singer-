'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ProductCard from '../product/product-card'
import { IProduct } from '@/lib/db/models/product.model'
import { convertToFrontendProduct } from '@/types/product'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function NewArrivalsSlider({
  title,
  products,
  viewAllLink,
}: {
  title: string
  products: IProduct[]
  viewAllLink?: string
}) {
  return (
    <div className='w-full bg-background py-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold relative pl-3 before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-full'>
          {title}
        </h2>
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
          >
            View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        )}
      </div>
      
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className='w-full'
      >
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product._id.toString()}
              className='pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
            >
              <div className="p-1 h-full"> {/* Added height for consistent card sizing */}
                <ProductCard
                  hideAddToCart={false}
                  hideBorder={true}
                  product={convertToFrontendProduct(product)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-0 bg-white/80 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300' />
        <CarouselNext className='right-0 bg-white/80 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300' />
      </Carousel>
    </div>
  )
}