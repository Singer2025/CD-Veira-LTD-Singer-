'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h2 className="text-2xl font-semibold text-gray-800">Something went wrong!</h2>
      <p className="text-gray-600 mt-2">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="mt-8"
      >
        Try again
      </Button>
    </div>
  )
}