'use client'

import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { i18n } from '@/i18n-config'

export default function LanguageSwitcher() {
  const t = useTranslations('Header')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLocaleChange = (newLocale: string) => {
    if (pathname) {
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
      router.push(newPathname)
    }
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className='flex items-center gap-1 px-3 py-1.5 rounded hover:bg-red-700 transition-colors duration-200'>
        <Globe className='h-4 w-4' />
        <span className='text-sm font-medium'>{t('Language')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className="mt-1 shadow-lg">
        {i18n.locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleLocaleChange(l.code)}
            className={`hover:bg-gray-100 ${locale === l.code ? 'font-medium' : ''}`}
          >
            {l.name} {l.icon}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
