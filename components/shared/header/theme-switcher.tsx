'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const t = useTranslations('Header')

  if (!mounted) return null

  return (
    <div className='flex items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200'>
          <div className='flex items-center gap-2'>
            <div className='rounded-full bg-gray-100 p-1.5 relative'>
              <SunIcon className='h-4 w-4 text-red-600 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
              <MoonIcon className='absolute inset-0 m-auto h-4 w-4 text-red-600 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            </div>
            <span className='text-sm font-medium'>{t('Theme')}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className="mt-1 shadow-lg">
          <DropdownMenuItem onClick={() => setTheme('light')} className="hover:bg-gray-100">
            <SunIcon className="h-4 w-4 mr-2" />
            {t('Light')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="hover:bg-gray-100">
            <MoonIcon className="h-4 w-4 mr-2" />
            {t('Dark')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="hover:bg-gray-100">
            <span className="mr-2 text-lg">⚙️</span>
            {t('System')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
