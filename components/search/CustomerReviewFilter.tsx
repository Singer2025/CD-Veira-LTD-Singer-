'use client';

import { Dispatch, SetStateAction } from 'react';
import { List, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Rating from '@/components/shared/product/rating';

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

interface CustomerReviewFilterProps {
  filterState: FilterState;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
}

export default function CustomerReviewFilter({ filterState, setFilterState }: CustomerReviewFilterProps) {
  const t = useTranslations('Search');

  const handleRatingSelect = (selectedRating: string) => {
    setFilterState(prevState => ({
      ...prevState,
      rating: selectedRating,
      page: '1', // Reset page when rating changes
    }));
  };

  return (
    <div className='py-4 px-4 bg-white dark:bg-gray-900'>
      <h3 className='font-semibold text-base mb-3 flex items-center gap-2'>
        <Star className='h-5 w-5 text-primary' />
        <span className="text-gray-800 dark:text-gray-200">{t('Customer Review')}</span>
      </h3>
      <div className="border-l-2 border-primary/20 pl-3 py-1">
        <ul className='space-y-2'>
          <li>
            <button
              className={`flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 text-sm transition-colors ${
                'all' === filterState.rating 
                  ? 'text-primary font-medium bg-primary/5' 
                  : 'text-foreground'
              } w-full text-left`}
              onClick={() => handleRatingSelect('all')}
            >
              <List className='h-4 w-4' />
              {t('All')}
            </button>
          </li>
          <li>
            <button
              className={`flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 text-sm transition-colors ${
                '4' === filterState.rating 
                  ? 'text-primary font-medium bg-primary/5' 
                  : 'text-foreground'
              } w-full text-left`}
              onClick={() => handleRatingSelect('4')}
            >
              <div className='flex items-center gap-1'>
                <Rating size={16} rating={4} />
                <span>{t('& Up')}</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}