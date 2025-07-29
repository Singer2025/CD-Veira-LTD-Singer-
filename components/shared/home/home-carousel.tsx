'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import type { ICarousel } from '@/types'

interface HomeCarouselProps {
  items: ICarousel[]
}
export function HomeCarousel({ items }: HomeCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )
  const carousels = React.useMemo(() => {
    console.log('Received carousel items:', items)
    const filtered = items?.filter((c: ICarousel) => c.isPublished) || []
    console.log('Filtered carousel items:', filtered)
    return filtered
  }, [items])

  return (
    <div className="relative overflow-hidden">
      <Carousel
        dir='ltr'
        plugins={[plugin.current]}
        className='w-full mx-auto'
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {carousels.map((item, index) => (
            <CarouselItem key={item.title}>
              <Link href={item.url}>
                <div className='flex aspect-[16/6] items-center justify-center relative overflow-hidden group'>
                  <Image
                    src={
                      item.image.startsWith('http') ? item.image :
                      item.image.startsWith('/') ? item.image :
                      `/images/${item.image}`
                    }
                    alt={item.title || 'Carousel banner'}
                    fill
                    className='object-cover transition-transform duration-700 group-hover:scale-105'
                    priority={index === 0}
                    onError={(e) => {
                      console.error(`Failed to load carousel image: ${item.image}`);
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className='absolute w-full h-full bg-gradient-to-r from-black/10 to-transparent z-10'></div>
                  <div className='absolute w-1/3 left-16 md:left-32 top-1/2 transform -translate-y-1/2 z-20 transition-all duration-500 group-hover:translate-x-2'>
                    <h2
                     className='text-xl md:text-6xl font-bold mb-4 text-white drop-shadow-md'
                     style={{ color: item.textColor || 'white' }}
                    >
                     {item.title}
                    </h2>
                    <Button
                     className='hidden md:block shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]'
                     style={{ color: item.textColor || 'inherit' }}
                    >
                     {item.buttonCaption || 'Shop Now'}
                    </Button>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-0 md:left-12 bg-white/80 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300' />
        <CarouselNext className='right-0 md:right-12 bg-white/80 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300' />
      </Carousel>
    </div>
  )
}
