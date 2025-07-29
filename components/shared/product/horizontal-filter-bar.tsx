import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function HorizontalFilterBar() {
  const t = await getTranslations('Search')
  
  return (
    <div className="w-full bg-singer-red text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Filter className="mr-2 h-4 w-4" />
            {t('Department')}
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Filter className="mr-2 h-4 w-4" />
            {t('Price')}
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Filter className="mr-2 h-4 w-4" />
            {t('Customer Review')}
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {t('Results')}: 24
          </span>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            {t('Clear')}
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}