import * as React from 'react'
import { Link } from '@/i18n/routing'
import { X, ChevronRight, UserCircle, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignOut } from '@/lib/actions/user.actions'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { getLocale, getTranslations } from 'next-intl/server'
import { getDirection } from '@/i18n-config'

export default async function Sidebar({
  categories,
}: {
  categories: any[]
}) {
  const session = await getServerSession(authOptions)

  const locale = await getLocale()

  const t = await getTranslations()
  return (
    <Drawer direction={getDirection(locale) === 'rtl' ? 'right' : 'left'}>      <DrawerTrigger className="drawer-trigger">
        <MenuIcon className='h-5 w-5' />
        <span className="font-medium">{t('Header.All')}</span>
      </DrawerTrigger>
      <DrawerContent className='categories-drawer'>
        <div className='flex flex-col h-full'>
          {/* User Sign In Section */}
          <div className='drawer-header'>
            <DrawerHeader>
              <DrawerTitle className='flex items-center'>
                <UserCircle className='h-6 w-6 mr-2' />
                {session ? (
                  <DrawerClose asChild>
                    <Link href='/account'>
                      <span className='text-lg font-semibold'>
                        {t('Header.Hello')}, {session.user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href='/sign-in'>
                      <span className='text-lg font-semibold'>
                        {t('Header.Hello')}, {t('Header.sign in')}
                      </span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant='ghost' size='icon' className='mr-2'>
                <X className='h-5 w-5' />
                <span className='sr-only'>Close</span>
              </Button>
            </DrawerClose>
          </div>          {/* Shop By Category */}
          <div className='flex-1 overflow-y-auto'>
            <h2 className='section-title'>
              {t('Header.Shop By Department')}
            </h2>
            <nav className='flex flex-col'>
              {/* Group categories by parent */}
              {(() => {
                // First, organize categories into a hierarchy
                const parentCategories = categories.filter(c => 
                  typeof c === 'object' && (c.isParent || !c.parent)
                );
                
                // Create a map of child categories by parent ID
                const childrenMap = new Map();
                categories.forEach(c => {
                  if (typeof c === 'object' && c.parent) {
                    const parentId = c.parent.toString();
                    if (!childrenMap.has(parentId)) {
                      childrenMap.set(parentId, []);
                    }
                    childrenMap.get(parentId).push(c);
                  }
                });
                
                // Render parent categories first, then their children
                return parentCategories.map(parent => {
                  const parentId = typeof parent === 'object' ? parent._id : parent;
                  const parentSlug = typeof parent === 'object' ? parent.slug : parent;
                  const parentName = typeof parent === 'object' ? parent.name : parent;
                  
                  const children = childrenMap.get(parentId) || [];
                  
                  return (
                    <div key={parentId} className="category-group">
                      <DrawerClose asChild>
                        <Link
                          href={`./search?category=${parentSlug}`}                          className="category-parent"
                        >
                          <span>{parentName}</span>
                          <ChevronRight className='h-4 w-4' />
                        </Link>
                      </DrawerClose>
                      
                      {/* Collapsible child categories */}
                      {children.length > 0 && (
                        <div className="child-categories">
                          {children.map(child => {
                            const childId = typeof child === 'object' ? child._id : child;
                            const childSlug = typeof child === 'object' ? child.slug : child;
                            const childName = typeof child === 'object' ? child.name : child;
                            
                            return (
                              <DrawerClose asChild key={childId}>
                                <Link
                                  href={`./search?category=${childSlug}`}
                                  className="child-link"
                                >
                                  <span>{childName}</span>
                                  <ChevronRight className='h-3 w-3' />
                                </Link>
                              </DrawerClose>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </nav>
          </div>          {/* Setting and Help */}
          <div className='border-t flex flex-col bg-gray-50'>
            <h2 className='section-title bg-white'>
              {t('Header.Help & Settings')}
            </h2>
            <DrawerClose asChild>
              <Link href='/account' className='item-button'>
                {t('Header.Your account')}
              </Link>
            </DrawerClose>{' '}
            <DrawerClose asChild>
              <Link href='/page/customer-service' className='item-button'>
                {t('Header.Customer Service')}
              </Link>
            </DrawerClose>
            {session ? (
              <form action={SignOut} className='w-full'>
                <Button
                  className='w-full justify-start item-button text-base'
                  variant='ghost'
                >
                  {t('Header.Sign out')}
                </Button>
              </form>
            ) : (
              <DrawerClose asChild>
                <Link href='/sign-in' className='item-button'>
                  {t('Header.Sign in')}
                </Link>
              </DrawerClose>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
