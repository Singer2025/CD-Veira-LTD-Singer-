'use client'

import { ShoppingCartIcon } from 'lucide-react'
import { Link } from '@/i18n/routing'
import useIsMounted from '@/hooks/use-is-mounted'
import useShowSidebar from '@/hooks/use-cart-sidebar'
import { cn } from '@/lib/utils'
import useCartStore from '@/hooks/use-cart-store'
import { useLocale, useTranslations } from 'next-intl'
import { getDirection } from '@/i18n-config'

export default function CartButton() {
  const isMounted = useIsMounted()
  const {
    cart: { items },
  } = useCartStore()
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)
  const showSidebar = useShowSidebar()
  const t = useTranslations() // Revert to global scope

  const locale = useLocale()
  return (
    <Link 
      href='/cart' 
      className='flex items-center gap-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 relative'
    >
      <div className='relative flex items-center justify-center'>
        <div className='rounded-full bg-white p-1.5'>
          <ShoppingCartIcon className='h-4 w-4 text-red-600' />
        </div>

        {isMounted && (
          <span
            className={cn(
              `bg-amber-400 text-black font-bold absolute ${
                getDirection(locale) === 'rtl' ? 'right-[-8px]' : 'left-[-8px]'
              } top-[-8px] z-10 shadow-md flex items-center justify-center min-w-[20px] h-[20px] text-xs rounded-full`,
              cartItemsCount >= 10 ? 'px-1 text-[10px]' : 'px-1.5'
            )}
          >
            {cartItemsCount}
          </span>
        )}
      </div>
      <div className='flex flex-col hidden sm:block'>
        <span className='text-sm font-semibold leading-tight text-white'>Cart</span>
      </div>

      {showSidebar && (
        <div
          className={`absolute top-[38px] ${
            getDirection(locale) === 'rtl'
              ? 'left-[-16px] rotate-[-270deg]'
              : 'right-[-16px] rotate-[-90deg]'
          } z-10 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-transparent border-b-background shadow-sm`}
        ></div>
      )}
    </Link>
  )
}
