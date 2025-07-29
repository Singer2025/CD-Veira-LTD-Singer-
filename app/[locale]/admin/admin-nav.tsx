'use client'
import { Link, usePathname } from '@/i18n/routing'
import React from 'react'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const links = [
  {
    title: 'Overview',
    href: '/admin/overview',
  },
  {
    title: 'Products',
    href: '/admin/products',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
  },
  {
    title: 'Brands',
    href: '/admin/brands',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
  {
    title: 'Pages',
    href: '/admin/web-pages',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
  },
]
export function AdminNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const t = useTranslations('Admin')
  return (
    <nav
      className={cn(
        'flex items-center flex-wrap overflow-hidden gap-2 md:gap-4',
        className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/10 relative',
            pathname.includes(item.href) 
              ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full' 
              : 'text-gray-300 hover:text-white'
          )}
        >
          {t(item.title)}
        </Link>
      ))}
    </nav>
  )
}
