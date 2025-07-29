'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { formUrlQuery } from '@/lib/utils'
import { useLocale } from 'next-intl'

export interface FilterState { // Added export
  q: string;
  category: string;
  tag: string;
  price: string;
  rating: string;
  brand: string;
  sort: string;
  page: string;
}

const DEFAULT_FILTER_STATE: FilterState = {
  q: '',
  category: '',
  tag: '',
  price: '',
  rating: '',
  brand: '',
  sort: '', // Or a sensible default like 'featured' or an empty string if handled by Select
  page: '1',
};

interface ProductSortSelectorProps {
  sortOrders: { value: string; name: string }[];
  filterState?: FilterState; // For backward compatibility
  setFilterState?: React.Dispatch<React.SetStateAction<FilterState>>; // For backward compatibility
  // New props for direct usage
  sort?: string;
  params?: {
    q?: string;
    category?: string;
    tag?: string;
    price?: string;
    rating?: string;
    brand?: string;
    sort?: string;
    page?: string;
  };
}

export default function ProductSortSelector({
  sortOrders,
  filterState, // Backward compatibility
  setFilterState, // Backward compatibility
  sort, // New direct prop
  params, // New direct prop
}: ProductSortSelectorProps) {
  // Handle both old and new prop patterns
  const isUsingNewProps = sort !== undefined && params !== undefined;
  const isUsingOldProps = filterState !== undefined && setFilterState !== undefined;
  
  // Create a compatible filterState object
  const actualFilterState = isUsingNewProps 
    ? { ...DEFAULT_FILTER_STATE, ...params, sort: sort || '' }
    : (filterState || DEFAULT_FILTER_STATE);

  // DEFENSIVE CHECKS
  if (!isUsingNewProps && !isUsingOldProps) {
    console.error('ProductSortSelector: Missing required props. Either (filterState + setFilterState) or (sort + params) must be provided');
    return (
      <div className="text-sm text-red-500">
        Sort functionality unavailable
      </div>
    );
  }
  
  // Check if setFilterState is a function when using old props
  if (isUsingOldProps && typeof setFilterState !== 'function') {
    console.error('ProductSortSelector: setFilterState is not a function');
    return (
      <div className="text-sm text-red-500">
        Sort functionality unavailable
      </div>
    );
  }

  // Check if sortOrders is valid
  if (!sortOrders || !Array.isArray(sortOrders) || sortOrders.length === 0) {
    console.error('ProductSortSelector: sortOrders is invalid', sortOrders);
    return (
      <div className="text-sm text-gray-500">
        No sorting options available
      </div>
    );
  }

  // Safe way to get the current sort display name
  const getCurrentSortName = () => {
    if (!actualFilterState.sort) { // Use actualFilterState
      return 'Select Sort Option';
    }
    
    const currentSort = sortOrders.find((s) => s.value === actualFilterState.sort); // Use actualFilterState
    return currentSort ? currentSort.name : 'Select Sort Option';
  };

  // Use the imported hooks
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const searchParams = typeof window !== 'undefined' ? useSearchParams() : null;
  const locale = typeof window !== 'undefined' ? useLocale() : 'en-US';
  
  // Safe onValueChange handler that works with both prop patterns
  const handleValueChange = (value: string) => {
    try {
      if (isUsingOldProps && setFilterState) {
        // Old pattern: Update the filterState directly
        setFilterState(prevState => {
          // Additional safety check
          if (!prevState) {
            console.error('ProductSortSelector: prevState is undefined in setFilterState');
            return {
              q: '',
              category: '',
              tag: '',
              price: '',
              rating: '',
              brand: '',
              sort: value,
              page: '1'
            };
          }

          return {
            ...prevState,
            sort: value,
            page: '1', // Reset page when sort changes
          };
        });
      } else if (isUsingNewProps && router && searchParams) {
        // New pattern: Update the URL with the new sort value
        let newUrl;
        if (typeof formUrlQuery === 'function') {
          newUrl = formUrlQuery({
            params: searchParams?.toString() || '',
            key: 'sort',
            value,
            path: `/${locale}${window.location.pathname.replace(/^\/[^/]+/, '')}`
          });
        } else {
          // Fallback if formUrlQuery is not available
          const urlParams = new URLSearchParams(searchParams?.toString() || '');
          urlParams.set('sort', value);
          newUrl = `?${urlParams.toString()}`;
        }
        
        // Also update page to 1
        let urlWithPage;
        if (typeof formUrlQuery === 'function') {
          urlWithPage = formUrlQuery({
            params: newUrl.split('?')[1] || '',
            key: 'page',
            value: '1',
            path: `/${locale}${window.location.pathname.replace(/^\/[^/]+/, '')}`
          });
        } else {
          // Fallback if formUrlQuery is not available
          const urlParams = new URLSearchParams(newUrl.split('?')[1] || '');
          urlParams.set('page', '1');
          urlWithPage = `?${urlParams.toString()}`;
        }
        
        router.push(urlWithPage, { scroll: false });
      }
    } catch (error) {
      console.error('ProductSortSelector: Error in handleValueChange', error);
    }
  };

  return (
    <div className="relative">
      <Select
        onValueChange={handleValueChange}
        value={actualFilterState.sort || ''}
      >
        <SelectTrigger className="min-w-[220px] rounded-full border-gray-200 bg-white shadow-sm hover:border-primary/30 focus:ring-primary/20">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>
            <SelectValue>
              <span className="font-medium">Sort By:</span> {getCurrentSortName()}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-lg border-gray-200 shadow-lg">
          {sortOrders.map((s) => (
            <SelectItem 
              key={s.value} 
              value={s.value}
              className="hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary"
            >
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}