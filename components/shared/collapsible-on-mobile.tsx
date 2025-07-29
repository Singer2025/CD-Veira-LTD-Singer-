'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import useDeviceType from '@/hooks/use-device-type'
import { Button } from '../ui/button'

export default function CollapsibleOnMobile({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()

  const deviceType = useDeviceType()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (deviceType === 'mobile') setOpen(false)
    else if (deviceType === 'desktop') setOpen(true)
  }, [deviceType, searchParams])
  if (deviceType === 'unknown') return null
  return (
    <Collapsible open={open} className="mb-4">
      <div className="flex items-center justify-between mb-2">
        {deviceType === 'desktop' && (
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        )}
        <CollapsibleTrigger asChild>
          {deviceType === 'mobile' && (
            <Button
              onClick={() => setOpen(!open)}
              variant={'outline'}
              className='w-full flex items-center justify-between rounded-full border-gray-200 bg-white shadow-sm hover:border-primary/30 focus:ring-primary/20'
            >
              <span className="font-medium">{title}</span>
              <ChevronDown 
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180 transform' : ''}`} 
              />
            </Button>
          )}
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent 
        className="animate-collapsible-down overflow-hidden data-[state=closed]:animate-collapsible-up"
      >
        <div className="pt-1 pb-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
