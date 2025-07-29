'use client'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu as MenuIcon } from 'lucide-react'
import UserButton from './user-button'
import LanguageSwitcher from './language-switcher'

export default function Menu({ forAdmin = false }: { forAdmin?: boolean }) {
  const t = useTranslations()
  return (
    <div className='flex items-center gap-2'>
      <div className='hidden md:flex items-center gap-2'>
        <LanguageSwitcher />
      </div>

      <div className='flex items-center gap-2'>
        <UserButton />
        {/* CartButton removed for informercial site */}
      </div>

      <div className='md:hidden'>
        <Sheet>
          <SheetTrigger className='flex items-center justify-center p-2 rounded hover:bg-red-700 transition-colors duration-200'>
            <MenuIcon className='h-5 w-5' />
          </SheetTrigger>
          <SheetContent side='right' className="border-l border-gray-200">
            <SheetHeader className='w-full border-b pb-4'>
              <div className='flex justify-between'>
                <SheetTitle>{t('Header.Site Menu')}</SheetTitle>
              </div>
            </SheetHeader>
            <div className='flex flex-col gap-4 py-4'>
              <LanguageSwitcher />
              <UserButton />
              {/* CartButton removed for informercial site */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
