import Image from 'next/image'
import { Link } from '@/i18n/routing'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminNav } from './admin-nav'
import { getSetting } from '@/lib/actions/setting.actions'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function AdminLayout({
  params,
  children,
}: {
  params: { locale: string }
  children: React.ReactNode
}) {
  const { site } = await getSetting()
  const messages = await getMessages()
  const locale = params.locale
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className='flex flex-col'>
        <div className='bg-gradient-to-r from-red-600 to-black text-white shadow-md'>
          <div className='flex h-16 items-center px-4'>
            <Link href='/' className='flex items-center gap-2 transition-transform hover:scale-105'>
              <Image
                src='/images/Singer Admin.png'
                width={40}
                height={40}
                alt={`${site.name} Admin logo`}
                className='rounded-md'
              />
            </Link>
            <AdminNav className='mx-6 hidden md:flex' />
            <div className='ml-auto flex items-center space-x-4'>
              <Menu forAdmin />
            </div>
          </div>
          <div>
            <AdminNav className='flex md:hidden px-4 pb-2' />
          </div>
        </div>
        <div className='flex-1 p-4'>{children}</div>
      </div>
    </NextIntlClientProvider>
  )
}
