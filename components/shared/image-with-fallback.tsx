'use client'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/default-product.png',
  unoptimized = true, // Set unoptimized to true by default
  loading,
  priority,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  
  // Handle the conflict between priority and loading='lazy'
  // If priority is true, don't set loading='lazy'
  const loadingProp = priority ? undefined : (loading || 'lazy')
  
  return (
    <Image
      {...props}
      src={error ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      unoptimized={unoptimized}
      loading={loadingProp}
      priority={priority}
    />
  )
}