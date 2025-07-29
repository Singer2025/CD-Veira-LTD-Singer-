/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from 'next/image'
import { useState } from 'react'

const ImageHover = ({
  src,
  hoverSrc,
  alt,
}: {
  src: string
  hoverSrc: string
  alt: string
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Removed delay for more immediate feedback
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      className='relative h-full w-full overflow-hidden rounded-lg'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes='80vw'
        priority
        className={`object-contain transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <Image
        src={hoverSrc}
        alt={`${alt} - alternate view`}
        fill
        sizes='80vw'
        className={`absolute inset-0 object-contain transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export default ImageHover
