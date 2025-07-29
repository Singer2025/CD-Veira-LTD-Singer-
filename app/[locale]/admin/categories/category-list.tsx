'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search, RefreshCw, List, LayoutGrid } from 'lucide-react'
import { EnhancedCategoryTree } from './enhanced-category-tree'
import { ICategory } from '@/lib/db/models/category.model'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Import the server action
import { getAllCategoriesForAdmin as serverGetAllCategoriesForAdmin } from '@/lib/actions/category.actions'

// Client-side wrapper for the server action
async function getAllCategoriesForAdmin(inputValue: string, page: number, fetchAll: boolean = false) {
  try {
    return await serverGetAllCategoriesForAdmin({
      query: inputValue,
      page,
      limit: 10,
      fetchAll
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export default function CategoryList() {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)
  const [fetchAll, setFetchAll] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const result = await getAllCategoriesForAdmin(inputValue, page, fetchAll)
      if (result) {
        setCategories(result.categories)
        setTotalPages(result.totalPages)
        setTotalCategories(result.totalCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [page, fetchAll])

  const handleSearch = () => {
    setPage(1) // Reset to first page on new search
    fetchCategories()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <Input
            placeholder="Search categories..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full sm:w-[300px]"
          />
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button onClick={fetchCategories} size="icon" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hierarchical-view"
              checked={fetchAll}
              onCheckedChange={(checked) => {
                setFetchAll(checked)
                setPage(1) // Reset to first page when switching view
              }}
            />
            <Label htmlFor="hierarchical-view">Hierarchical View</Label>
          </div>
          
          <div className="flex items-center space-x-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No categories found</p>
        </div>
      ) : (
        <div>
          <EnhancedCategoryTree 
            categories={categories} 
            query={inputValue}
            onRefresh={fetchCategories}
          />
          
          {!fetchAll && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {categories.length} of {totalCategories} categories
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}