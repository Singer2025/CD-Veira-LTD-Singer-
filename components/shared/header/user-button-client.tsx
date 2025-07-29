'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOut } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useSession } from 'next-auth/react'

interface UserButtonClientProps {
  locale: string
}

export default function UserButtonClient({ locale }: UserButtonClientProps) {
  const t = useTranslations('Header')
  const { data: session } = useSession()
  
  return (
    <div className='flex items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center gap-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors duration-200' asChild>
          <div className='flex items-center gap-2'>
            <div className='rounded-full bg-white p-1.5'>
              <UserIcon className='h-4 w-4 text-red-600' />
            </div>
            <div className='flex flex-col text-left hidden sm:block'>
              <span className='text-xs font-light text-white/90'>
                {t('Hello')},{' '}
                {session?.user ? session.user.name : t('sign in')}
              </span>
              <span className='text-sm font-semibold leading-tight flex items-center text-white'>
                {t('Account & Orders')} <ChevronDownIcon className='h-3 w-3 ml-1 text-white/80' />
              </span>
            </div>
          </div>
        </DropdownMenuTrigger>
        {session?.user ? (
          <DropdownMenuContent className='w-56 shadow-lg border border-gray-200' align='end' forceMount>
            <DropdownMenuLabel className='font-normal bg-gray-50 border-b border-gray-200'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none text-gray-800'>
                  {session.user.name}
                </p>
                <p className='text-xs leading-none text-gray-500'>
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup className='py-1'>
              <Link className='w-full' href='/account'>
                <DropdownMenuItem className='hover:bg-gray-100 hover:text-red-600 transition-colors duration-200'>
                  {t('Your account')}
                </DropdownMenuItem>
              </Link>
              <Link className='w-full' href='/account/orders'>
                <DropdownMenuItem className='hover:bg-gray-100 hover:text-red-600 transition-colors duration-200'>
                  {t('Your orders')}
                </DropdownMenuItem>
              </Link>

              {session.user.role === 'Admin' && (
                <Link className='w-full' href='/admin/overview'>
                  <DropdownMenuItem className='hover:bg-gray-100 hover:text-red-600 transition-colors duration-200'>
                    {t('Admin')}
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <div className='border-t border-gray-200 pt-1'>
              <DropdownMenuItem className='p-0'>
                <form action={SignOut} className='w-full'>
                  <Button
                    className='w-full py-2 px-3 h-8 justify-start text-red-600 hover:text-red-700 hover:bg-gray-100'
                    variant='ghost'
                  >
                    {t('Sign out')}
                  </Button>
                </form>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className='w-56 shadow-lg border border-gray-200' align='end' forceMount>
            <DropdownMenuGroup className='p-2'>
              <DropdownMenuItem className='p-0 mb-2'>
                <Link
                  className={cn(buttonVariants({ variant: 'default' }), 'w-full bg-red-600 hover:bg-red-700 text-white')}
                  href="/sign-in"
                >
                  {t('Sign in')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel className='border-t border-gray-200 pt-2'>
              <div className='font-normal text-center'>
                {t('New Customer')}?{' '}
                <Link href="/sign-up" className='text-red-600 hover:text-red-700 font-medium'>
                  {t('Sign up')}
                </Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  )
}