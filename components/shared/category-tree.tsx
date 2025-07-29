'use client'

import { useState } from 'react'
// import { Link } from '@/i18n/routing' // Removed unused import
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Types } from 'mongoose'

interface Category {
  _id: string | Types.ObjectId
  name: string
  slug: string
  parent?: string | Types.ObjectId
  isParent?: boolean
}

// Define FilterState interface (or import if available globally)
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

const DEFAULT_FILTER_STATE: FilterState = {
  q: '',
  category: '',
  tag: '',
  price: '',
  rating: '',
  brand: '',
  sort: '',
  page: '1',
};

interface CategoryTreeProps {
  categories: Category[]
  filterState?: FilterState; // Made filterState optional
  onCategorySelect: (categorySlug: string) => void; // Add callback for category selection
}

export function CategoryTree({ categories, filterState, onCategorySelect }: CategoryTreeProps) {
  const actualFilterState = filterState || DEFAULT_FILTER_STATE; // Use default if prop is undefined
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()) // State stores string IDs

  const toggleCategory = (categoryId: string) => { // Parameter is string ID
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderCategory = (category: Category, depth = 0) => {
    const categoryIdString = category._id.toString();
    const isParent = category.isParent || categories.some(c => c.parent?.toString() === categoryIdString)
    const isExpanded = expandedCategories.has(categoryIdString)
    const isActive = category.slug === actualFilterState.category
    
    return (
      <li key={categoryIdString} className="filter-item py-0.5"> 
        <div className="flex items-center group">
          {isParent && (
            <button
              onClick={() => toggleCategory(categoryIdString)}
              className="mr-1 text-gray-400 hover:text-primary transition-colors"
              aria-label={isExpanded ? "Collapse category" : "Expand category"}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            </button>
          )}
          <button
            className={`px-3 py-2 rounded-full transition-all duration-200 text-left w-full ${isActive 
              ? 'text-primary font-medium bg-primary/10 shadow-sm' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-primary'}`}
            onClick={() => onCategorySelect(category.slug)}
            style={{ paddingLeft: !isParent ? `calc(${depth * 0.75}rem + 0.75rem)` : '0.75rem' }}
          >
            <span className="truncate block font-medium">{category.name}</span>
          </button>
        </div>
        {isParent && isExpanded && (
          <ul className="ml-4 mt-1 border-l border-gray-200 pl-2 space-y-1">
            {categories
              .filter(c => c.parent?.toString() === categoryIdString)
              .map(child => renderCategory(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <ul className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
      {categories
        .filter(c => !c.parent)
        .map(category => renderCategory(category))}
    </ul>
  )
}