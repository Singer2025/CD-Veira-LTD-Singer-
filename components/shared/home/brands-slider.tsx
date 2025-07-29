'use client'

import * as React from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

interface Brand {
  _id: string
  name: string
  slug: string
  logo?: string
}

export default function BrandsSlider({
  title,
  brands,
}: {
  title: string
  brands: Brand[]
}) {
  return (
    <div className='w-full bg-background py-6'>
      <h2 className='text-2xl font-bold relative pl-3 mb-6 before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-full'>{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className='w-full'
      >
        <CarouselContent>
          {brands.map((brand) => (
            <CarouselItem
              key={brand._id}
              className='md:basis-1/4 lg:basis-1/6 pl-4'
            >
              <Link href={`./search?brand=${brand.slug}`} className="block">
                <Card className="h-full border shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                    {brand.logo ? (
                      <div className="relative h-20 w-full mb-3 overflow-hidden group">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-full flex items-center justify-center mb-3 bg-muted rounded-md hover:bg-muted/80 transition-colors duration-300">
                        <span className="text-2xl font-bold text-muted-foreground">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-center font-medium text-foreground/80 hover:text-primary transition-colors duration-200">{brand.name}</p>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-0 bg-white/80 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300' />
        <CarouselNext className='right-0 bg-white/80 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300' />
      </Carousel>
    </div>
  )
}