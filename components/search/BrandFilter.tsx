'use client';

import { Dispatch, SetStateAction } from 'react';
import { Building2, List } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslations } from 'next-intl';
import { IBrand } from '@/lib/db/models/brand.model';
import ImageWithFallback from '@/components/shared/image-with-fallback';

interface FilterState {
  q: string;
  category: string;
  tag: string;
  price: string;
  rating: string;
  brand: string;
  sort: string;
  page: string;
}

interface BrandFilterProps {
  brands: IBrand[];
  filterState: FilterState;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
}

export default function BrandFilter({ brands, filterState, setFilterState }: BrandFilterProps) {
  const t = useTranslations('Search');

  const handleBrandSelect = (brandSlug: string) => {
    setFilterState(prevState => ({
      ...prevState,
      brand: brandSlug,
      page: '1', // Reset page when brand changes
    }));
  };

  return (
    <AccordionItem value="brands" className="overflow-hidden">
      <AccordionTrigger className="text-base font-semibold hover:no-underline py-4 px-4 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
        <div className='flex items-center gap-2'>
          <Building2 className='h-5 w-5 text-primary' />
          <span className="text-gray-800 dark:text-gray-200">{t('Brands')}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 px-2 bg-white dark:bg-gray-900">
        <div className="border-l-2 border-primary/20 pl-3 py-1">
          <ul className='space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar'>
            <li>
              <button
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 text-sm transition-colors ${
                  'all' === filterState.brand 
                    ? 'text-primary font-medium bg-primary/5' 
                    : 'text-foreground'
                } w-full text-left`}
                onClick={() => handleBrandSelect('all')}
              >
                <List className='h-4 w-4' />
                {t('All')}
              </button>
            </li>
            {brands.map((b: IBrand) => (
              <li key={b._id.toString()}>
                <button
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 text-sm transition-colors ${
                    b.slug === filterState.brand 
                      ? 'text-primary font-medium bg-primary/5' 
                      : 'text-foreground'
                  } w-full text-left`}
                  onClick={() => handleBrandSelect(b.slug)}
                >
                  {b.logo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm overflow-hidden">
                        <ImageWithFallback
                          src={b.logo}
                          alt={b.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      {b.name}
                    </div>
                  ) : (
                    b.name
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}