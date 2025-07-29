'use client';

import { Dispatch, SetStateAction } from 'react';
import { Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PriceFilter } from '@/components/shared/price-filter';

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

interface PriceRangeFilterProps {
  filterState: FilterState;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
  maxPrice: number;
}

export default function PriceRangeFilter({ filterState, setFilterState, maxPrice }: PriceRangeFilterProps) {
  const t = useTranslations('Search');

  const handlePriceRangeChange = (priceRange: string) => {
    setFilterState(prevState => ({
      ...prevState,
      price: priceRange,
      page: '1', // Reset page when price range changes
    }));
  };

  return (
    <div className='py-4 px-4 bg-gray-50 dark:bg-gray-800/50'>
      <h3 className='font-semibold text-base mb-3 flex items-center gap-2'>
        <Tag className='h-5 w-5 text-primary' />
        <span className="text-gray-800 dark:text-gray-200">{t('Price')}</span>
      </h3>
      <div className="px-1 bg-white dark:bg-gray-900 p-3 rounded-md shadow-sm">
         <PriceFilter price={filterState.price} maxPrice={maxPrice} onPriceRangeChange={handlePriceRangeChange} />
      </div>
    </div>
  );
}