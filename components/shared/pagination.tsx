'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import React from 'react'

// Import formUrlQuery safely for client-side only usage
let formUrlQuery: any
if (typeof window !== 'undefined') {
  formUrlQuery = require('@/lib/utils').formUrlQuery
}

import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

type PaginationProps = {
  currentPage: number
  totalPages: number
  urlParamName?: string
  onPageChange?: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, urlParamName, onPageChange }: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()

  const onClick = (btnType: string) => {
    const pageValue = btnType === 'next' ? Number(currentPage) + 1 : Number(currentPage) - 1
    
    if (onPageChange) {
      onPageChange(pageValue);
      return;
    }

    // Check if formUrlQuery is defined before using it
    if (typeof formUrlQuery === 'function') {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: urlParamName || 'page',
        value: pageValue.toString(),
        path: window.location.pathname.replace(/^\/[^\/]+/, '')
      })
      
      router.push(newUrl, { scroll: true })
    } else {
      // Fallback if formUrlQuery is not available
      const params = new URLSearchParams(searchParams.toString())
      params.set(urlParamName || 'page', pageValue.toString())
      router.push(`${window.location.pathname.replace(/^\/[^\/]+/, '')}?${params.toString()}`, { scroll: true })
    }
  }

  const t = useTranslations('Search')
  return (
    <div className='flex items-center gap-2'>
      <Button
        size='lg'
        variant='outline'
        onClick={() => onClick('prev')}
        disabled={Number(currentPage) <= 1}
        className='w-24'
      >
        <ChevronLeft /> {t('Previous')}
      </Button>
      {t('Page')} {currentPage} {t('of')} {totalPages}
      <Button
        size='lg'
        variant='outline'
        onClick={() => onClick('next')}
        disabled={Number(currentPage) >= totalPages}
        className='w-24'
      >
        {t('Next')} <ChevronRight />
      </Button>
    </div>
  )
}

export default Pagination
