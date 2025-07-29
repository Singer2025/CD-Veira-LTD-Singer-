'use client'

import { useState } from 'react'
import Image from 'next/image'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
export default function ProductGallery({ images }: { images?: string[] }) {
  // Check if images array exists and has items
  const hasImages = images && images.length > 0
  const [selectedImage, setSelectedImage] = useState(0)
  
  // If no images, show placeholder
  if (!hasImages) {
    return (
      <div className='w-full'>
        <div className='relative aspect-square h-[250px] sm:h-[320px] lg:h-[400px]'>
          <Image
            src='/images/placeholder.jpg'
            alt='product image placeholder'
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw'
            className='object-contain'
            priority
          />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-3 sm:gap-4">

      {/* Main Image */}
      <div className="w-full">
        <Zoom>
          <div className="relative aspect-square h-[250px] sm:h-[320px] lg:h-[400px] bg-white rounded-lg overflow-hidden border border-gray-100">
            <Image
              src={images[selectedImage]}
              alt={'product image'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              className="object-contain p-1 sm:p-2 lg:p-3"
              priority
            />
          </div>
        </Zoom>
      </div>

      {/* Thumbnails */}
      <div className="flex flex-row gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedImage(index)
            }}
            className={`flex-shrink-0 bg-white rounded-md overflow-hidden transition-all duration-200 ${
              selectedImage === index
                ? 'ring-2 ring-blue-500 shadow-sm'
                : 'ring-1 ring-gray-200 hover:ring-gray-300'
            }`}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16">
              <Image 
                src={image} 
                alt={'product image'} 
                fill
                sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 64px"
                className="object-contain p-0.5 sm:p-1"
              />
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}
