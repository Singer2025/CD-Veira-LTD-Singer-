import React from 'react'
import { Star } from 'lucide-react'

export default function Rating({
  rating = 0,
  size = 16, // Default size in pixels (e.g., 16px)
}: {
  rating: number
  size?: number
}) {
  const fullStars = Math.floor(rating)
  const partialStar = rating % 1
  const emptyStars = 5 - Math.ceil(rating)

  return (
    <div
      className='flex items-center'
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          // Apply size using inline style, remove w-/h- classes
          className={`fill-primary text-primary`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      ))}
      {partialStar > 0 && (
        <div className='relative'>
          {/* Base star for partial */}
          <Star
            className={`text-primary`}
            style={{ width: `${size}px`, height: `${size}px` }}
          />
          <div
            className='absolute top-0 left-0 overflow-hidden'
            style={{ width: `${partialStar * 100}%` }}
          >
            {/* Filled portion of partial star - MUST use the size prop */}
            <Star
              className='fill-primary text-primary'
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          // Apply size using inline style, remove w-/h- classes
          className={`text-primary`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      ))}
    </div>
  )
}
