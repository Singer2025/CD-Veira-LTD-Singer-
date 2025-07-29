'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Edit, Folder, FolderOpen, Tag, Layers, Plus } from 'lucide-react'
import { ICategory } from '@/lib/db/models/category.model'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatId } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Create a server action wrapper
import { deleteCategory as serverDeleteCategory } from '@/lib/actions/category.actions'

// Client-side wrapper for the server action
async function deleteCategory(id: string) {
  try {
    return await serverDeleteCategory(id)
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

interface EnhancedCategoryTreeProps {
  categories: ICategory[]
  onRefresh: () => void
  query: string
}

// Define level colors for visual hierarchy
const LEVEL_COLORS = {
  0: 'border-l-4 border-l-primary',
  1: 'border-l-4 border-l-blue-500',
  2: 'border-l-4 border-l-amber-500',
  3: 'border-l-4 border-l-green-500',
}

// Define level names for better context
const LEVEL_NAMES = {
  0: 'Main Category',
  1: 'Sub-Category',
  2: 'Section',
  3: 'Sub-Section',
}

// Define level icons for visual distinction
const LEVEL_ICONS = {
  0: <Layers className="h-4 w-4 text-primary" />,
  1: <Layers className="h-4 w-4 text-blue-500" />,
  2: <Layers className="h-4 w-4 text-amber-500" />,
  3: <Layers className="h-4 w-4 text-green-500" />,
}

export function EnhancedCategoryTree({ categories, query, onRefresh }: EnhancedCategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryMap, setCategoryMap] = useState<Map<string, ICategory[]>>(new Map())
  
  // Initialize with all categories expanded if there's a search query
  useEffect(() => {
    if (query) {
      const allIds = new Set(categories.map(c => c._id.toString()))
      setExpandedCategories(allIds)
    }
  }, [query, categories])

  // Build category hierarchy map
  useEffect(() => {
    const map = new Map<string, ICategory[]>()
    
    // Initialize with empty arrays for all possible parents
    categories.forEach(category => {
      map.set(category._id.toString(), [])
    })
    
    // Then populate with children
    categories.forEach(category => {
      if (category.parent) {
        const parentId = category.parent.toString()
        const children = map.get(parentId) || []
        children.push(category)
        map.set(parentId, children)
      }
    })
    
    setCategoryMap(map)
  }, [categories])

  const toggleCategory = (categoryId: string) => {
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

  const renderCategory = (category: ICategory, depth = 0) => {
    const categoryId = category._id.toString()
    const children = categoryMap.get(categoryId) || []
    const hasChildren = children.length > 0
    const isExpanded = expandedCategories.has(categoryId)
    
    // Get level-specific styling
    const levelColor = LEVEL_COLORS[Math.min(depth, 3) as keyof typeof LEVEL_COLORS]
    const levelName = LEVEL_NAMES[Math.min(depth, 3) as keyof typeof LEVEL_NAMES]
    const levelIcon = LEVEL_ICONS[Math.min(depth, 3) as keyof typeof LEVEL_ICONS]
    
    // Calculate background opacity based on depth
    const bgOpacity = 5 + (depth * 5)
    const bgColorClass = `bg-primary/${bgOpacity > 25 ? 25 : bgOpacity}`

    return (
      <div key={categoryId} className={`mb-2 rounded-md overflow-hidden border ${bgColorClass} ${levelColor}`}>
        <div className="p-3">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button 
                onClick={() => toggleCategory(categoryId)}
                className="text-muted-foreground hover:text-primary"
                aria-label={isExpanded ? "Collapse category" : "Expand category"}
              >
                {isExpanded ? 
                  <FolderOpen className="h-5 w-5 text-amber-500" /> : 
                  <Folder className="h-5 w-5 text-amber-500" />
                }
              </button>
            ) : (
              <Tag className="h-5 w-5 ml-0.5 mr-0.5 text-blue-500" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/categories/${categoryId}`} 
                      className="font-medium hover:underline text-primary"
                    >
                      {category.name}
                    </Link>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs">
                            {levelName}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Level {depth} in the category hierarchy</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Tag className="h-3 w-3" />
                    <span>{category.slug}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  ID: {formatId(categoryId)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="flex items-center gap-1">
                  {levelIcon}
                  <span className="text-muted-foreground">Depth:</span> 
                  <span>{category.depth}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {formatDateTime(category.updatedAt).dateTime}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {depth < 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/admin/categories/create?parent=${categoryId}`}>
                          <Plus className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add child category</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button asChild variant='outline' size='sm'>
                <Link href={`/admin/categories/${categoryId}`}>
                  <Edit className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <DeleteDialog
                id={categoryId}
                action={async (id: string) => {
                  const result = await deleteCategory(id);
                  return { ...result, message: result.success ? 'Category deleted successfully' : 'Failed to delete category' };
                }}
                callbackAction={onRefresh}
              />
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 pl-4 border-l-2 border-dashed border-primary/30">
            {children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // If there's a search query, show all categories in a flat list
  if (query) {
    return (
      <div className="space-y-2">
        {categories.map(category => renderCategory(category, category.depth))}
      </div>
    )
  }

  // Default view (no query): Render all categories for current page
  return (
    <div className="space-y-2">
      {categories.map(category => renderCategory(category, category.depth))}
    </div>
  )
}