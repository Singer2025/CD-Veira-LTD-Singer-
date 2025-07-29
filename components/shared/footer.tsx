'use client'
import { ChevronUp, Facebook, Twitter, Instagram, Youtube, Linkedin, LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import footerData from '@/config/footerConfig.json' // Assuming @/ is src/ or similar

import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { i18n } from '@/i18n-config'

const LucideIcons: { [key: string]: LucideIcon } = {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
};

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n

  const locale = useLocale()
  const t = useTranslations()
  
  return (
    <footer className='bg-red-600 text-white underline-link'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='bg-gray-800 w-full rounded-none'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          {t('Footer.Back to top')}
        </Button>
        
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 p-6 sm:p-8 max-w-7xl mx-auto'>
          {footerData.linkSections.map((section) => (
            <div key={section.id} className='space-y-4'>
              <h3 className='font-bold text-base sm:text-lg'>{t(section.titleKey)}</h3>
              <ul className='space-y-2 text-sm'>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className='hover:underline transition-colors duration-200'>
                      {t(link.textKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Get Social */}
          <div className='space-y-4'>
            <h3 className='font-bold text-base sm:text-lg'>{t('Footer.GetSocial.title')}</h3>
            <div className='flex flex-col space-y-3'>
              {footerData.socialLinks.map((social) => {
                const IconComponent = LucideIcons[social.icon];
                return (
                  <Link key={social.name} href={social.href} className='flex items-center gap-2 hover:underline text-sm transition-colors duration-200'>
                    {IconComponent && <IconComponent className='h-5 w-5' />}
                    {social.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Language and Currency Selection */}
        <div className='border-t border-gray-800'>
          <div className='max-w-7xl mx-auto py-6 px-4'>
            <div className='flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <Image
                  src='/images/logo.png'
                  width={80}
                  height={64}
                  alt='Site Logo'
                  className='w-16 sm:w-20 h-auto'
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </div>
              <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
                <Select
                  value={locale}
                  onValueChange={(value) => {
                    router.push(pathname, { locale: value })
                  }}
                >
                  <SelectTrigger className="bg-red-700 border-white hover:bg-red-800 text-white w-full sm:min-w-[160px]">
                    <SelectValue placeholder={t('Footer.Select a language')}>
                      {i18n.locales.find(l => l.code === locale)?.name || locale}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {i18n.locales.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.icon}</span> {lang.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currency}
                  onValueChange={(value) => {
                    setCurrency(value)
                    window.scrollTo(0, 0)
                  }}
                >
                  <SelectTrigger className="bg-red-700 border-white hover:bg-red-800 text-white w-full sm:min-w-[160px]">
                    <SelectValue placeholder={t('Footer.Select a currency')}>
                      {availableCurrencies.find(c => c.code === currency)?.name || ''} ({currency})
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies
                      .filter((x) => x.code)
                      .map((curr, index) => (
                        <SelectItem key={index} value={curr.code}>
                          {curr.name} ({curr.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className='p-4 sm:p-6 bg-red-700'>
          <div className='max-w-7xl mx-auto space-y-4'>
            {/* Legal Links */}
            <div className='flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm'>
              {footerData.legalLinks.map((link, index) => (
                <span key={link.href} className='inline-flex items-center'>
                  <Link href={link.href} className='hover:underline transition-colors duration-200'>
                    {t(link.textKey)}
                  </Link>
                  {index < footerData.legalLinks.length - 1 && (
                    <span className='text-red-300 mx-2 hidden sm:inline'>|</span>
                  )}
                </span>
              ))}
            </div>
            
            {/* Copyright */}
            <div className='text-center text-xs sm:text-sm'>
              <p className='font-medium'>©2025 CD Veira LTD. All rights reserved.</p>
            </div>
            
            {/* Contact Info */}
            <div className='text-center text-xs sm:text-sm text-white'>
              <div className='bg-red-800 px-3 sm:px-4 py-2 rounded-full inline-block'>
                <div className='flex flex-col sm:flex-row items-center gap-1 sm:gap-2'>
                  <span>Address: 5Q3G+J8V, Halifax St, Kingstown</span>
                  <span className='hidden sm:inline'>|</span>
                  <span>Phone: (784) 456-1857</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
