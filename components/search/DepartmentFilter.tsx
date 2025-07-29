'use client';

import { Folder, List } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslations } from 'next-intl';
import { CategoryTree } from '@/components/shared/category-tree';
import { ICategory } from '@/lib/db/models/category.model';

import { Dispatch, SetStateAction } from 'react';

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

interface DepartmentFilterProps {
  categories: ICategory[];
  filterState: FilterState;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
}

export default function DepartmentFilter({ categories, filterState, setFilterState }: DepartmentFilterProps) {
  const t = useTranslations('Search');

  const handleCategorySelect = (categorySlug: string) => {
    setFilterState(prevState => ({
      ...prevState,
      category: categorySlug,
      page: '1', // Reset page when category changes
    }));
  };

  return (
    <AccordionItem value="department" className="overflow-hidden">
      <AccordionTrigger className="text-base font-semibold hover:no-underline py-4 px-4 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
        <div className='flex items-center gap-2'>
          <Folder className='h-5 w-5 text-primary' />
          <span className="text-gray-800 dark:text-gray-200">{t('Department')}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 px-2 bg-white dark:bg-gray-900">
        <div className="border-l-2 border-primary/20 pl-3 py-1">
          <ul className='space-y-2'>
            <li>
              <button
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 text-sm transition-colors ${
                  ('all' === filterState.category || '' === filterState.category) 
                    ? 'text-primary font-medium bg-primary/5' 
                    : 'text-foreground'
                } w-full text-left`}
                onClick={() => handleCategorySelect('all')}
              >
                <List className='h-4 w-4' />
                {t('All')}
              </button>
            </li>
            <div className="mt-1">
              <CategoryTree
                categories={categories}
                filterState={filterState}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}