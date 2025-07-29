import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { getSetting } from '@/lib/actions/setting.actions'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getDirection } from '@/i18n-config'

export default async function Search() {
  const {
    site: { name },
  } = await getSetting()
  const t = await getTranslations()
  const locale = await getLocale()
  const dir = getDirection(locale)
  
  return (
    <form
      action={`/${locale}/search`}
      method='GET'
      className='flex w-full mx-auto'
      dir={dir}
    >
      <div className='flex-1 flex shadow-sm rounded-md overflow-hidden'>
        <Input
          name='q'
          type='search'
          placeholder={t('Header.Search Placeholder')}
          className='w-full border-2 border-gray-300 focus-visible:ring-1 focus-visible:ring-red-600 focus-visible:border-red-600 h-11 px-4 shadow-sm bg-white rounded-l-md'
        />
        <Button
          type='submit'
          size='icon'
          className='rounded-r-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-500 hover:border-red-600 transition-colors duration-200 shadow-sm h-11 px-4 min-w-[50px]'
        >
          <SearchIcon className='h-5 w-5' />
        </Button>
      </div>
    </form>
  )
}
