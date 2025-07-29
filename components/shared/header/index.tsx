import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations, getLocale } from 'next-intl/server'
import { Facebook, Instagram, Phone, Twitter } from 'lucide-react' // Added social icons

import Search from './search' // Existing search component
import UserButton from './user-button' // Existing user button (Account/Sign In)
import LanguageSwitcher from './language-switcher' // Existing language switcher
import CurrencySwitcher from './currency-switcher' // Newly created currency switcher

// Define navigation links based on the new design
// Placeholder HREFs for items that might be dropdowns or need specific paths
const newNavLinks = [
  { href: '/', textKey: 'Header.NavHome' },
  { href: '/search', textKey: 'Header.NavShop' }, // SHOP links to search page
  { href: '/deals', textKey: 'Header.NavFeaturesDeals' }, // Placeholder
  { href: '/brands', textKey: 'Header.NavBrands' }, // Placeholder
  { href: '/support/repair', textKey: 'Header.NavPartsRepair' }, // Placeholder
  { href: '/about', textKey: 'Header.About Us' }, // Reuses existing key
  { href: '/contact', textKey: 'Header.NavContactUs' },
  { href: '/page/help-faq', textKey: 'Header.HelpFAQsLink' }, // Placeholder
]

export default async function Header() {
  const { site } = await getSetting()
  const t = await getTranslations()
  const locale = await getLocale()

  // Using a consistent red color for the header bars.
  // You can adjust this to match your specific brand red, e.g., site.primaryColor if available.
  const headerRedBg = 'bg-red-700' 
  const headerTextColor = 'text-white'
  const topBarTextColor = 'text-white/90'

  return (
    <header className='sticky top-0 z-50 shadow-md font-sans'>
      {/* Top Bar */}
      <div className={`${headerRedBg} ${topBarTextColor} text-xs`}>
        <div className="container mx-auto px-4 sm:px-6 py-1.5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-center sm:text-left">{t('Header.CompanyTagline')}</p>
            </div>
            <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Link href="/page/help-faq" className="hover:text-white hover:underline whitespace-nowrap">
                {t('Header.HelpFAQsLink')}
              </Link>
              <span className="opacity-50 hidden sm:inline">|</span>
              <CurrencySwitcher />
              <span className="opacity-50 hidden sm:inline">|</span>
              <LanguageSwitcher />
              <div className="flex items-center space-x-2">
                <Link href="#" aria-label="Twitter" className="hover:text-white"><Twitter size={16} /></Link>
                <Link href="#" aria-label="Instagram" className="hover:text-white"><Instagram size={16} /></Link>
                <Link href="#" aria-label="Facebook" className="hover:text-white"><Facebook size={16} /></Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className={`${headerRedBg} ${headerTextColor}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Top row on mobile: Logo and User Actions */}
            <div className="flex w-full lg:w-auto justify-between items-center">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className='flex items-center'>
                  <Image
                    src={site.logo}
                    width={140}
                    height={42}
                    alt={`${site.name} Logo`}
                    className="object-contain h-8 sm:h-10 md:h-12 w-auto"
                    priority
                  />
                </Link>
              </div>

              {/* User Button - Always visible on mobile */}
              <div className="lg:hidden">
                <UserButton />
              </div>
            </div>

            {/* Search Bar - Full width on mobile */}
            <div className='w-full lg:flex-grow lg:mx-8 lg:max-w-xl'>
              <Search />
            </div>

            {/* Right-side actions: Call Us & User Account - Desktop only */}
            <div className="hidden lg:flex flex-shrink-0 items-center space-x-4">
              {/* Call Us Now */}
              <div className="hidden xl:flex items-center space-x-2 text-right">
                <Phone size={24} className={`${headerTextColor}`} />
                <div>
                  <p className="text-xs uppercase">{t('Header.CallUsNow')}</p>
                  <p className="text-lg whitespace-nowrap">1-784-456-1857</p>
                </div>
              </div>
              {/* User Button (Account/Sign In) */}
              <UserButton />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className='bg-white px-4 sm:px-6 border-b border-gray-200 shadow-sm'>
        <div className="container mx-auto">
          <nav className='flex justify-center items-center'>
            <div className='flex items-center space-x-1 py-2.5 overflow-x-auto scrollbar-hide max-w-full'>
              {newNavLinks.map((link) => (
                <Link
                  href={link.href}
                  key={link.textKey}
                  className='whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 hover:text-red-700 rounded-md transition-colors duration-200 flex-shrink-0'
                >
                  {t(link.textKey)}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
