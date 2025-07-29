'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  currentPage: number
  totalPages: number
  urlParamName?: string
  onPageChange?: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, urlParamName, onPageChange }: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onClick = (btnType: string) => {
    const pageValue = btnType === 'next' ? Number(currentPage) + 1 : Number(currentPage) - 1
    
    if (onPageChange) {
      onPageChange(pageValue);
      return;
    }

    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(searchParams.toString())
    // Update the page parameter
    params.set(urlParamName || 'page', pageValue.toString())
    // Navigate to the new URL
    router.push(`?${params.toString()}`, { scroll: true })
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        size='lg'
        variant='outline'
        onClick={() => onClick('prev')}
        disabled={Number(currentPage) <= 1}
        className='w-24'
      >
        <ChevronLeft /> Previous
      </Button>
      Page {currentPage} of {totalPages}
      <Button
        size='lg'
        variant='outline'
        onClick={() => onClick('next')}
        disabled={Number(currentPage) >= totalPages}
        className='w-24'
      >
        Next <ChevronRight />
      </Button>
    </div>
  )
}

export default Pagination