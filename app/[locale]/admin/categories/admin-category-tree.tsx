'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { Edit, Folder, FolderOpen, Tag, Layers } from 'lucide-react'
import { ICategory } from '@/lib/db/models/category.model'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatId } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import { deleteCategory } from '@/lib/actions/category.actions'

interface AdminCategoryTreeProps {
  categories: ICategory[]
  onRefresh: () => void
  query: string
}

export function AdminCategoryTree({ categories, query, onRefresh }: AdminCategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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

  // Build a map of parent to children for efficient lookup
  const categoryMap = new Map<string, ICategory[]>()
  
  // First, initialize with empty arrays for all possible parents
  categories.forEach(category => {
    categoryMap.set(category._id.toString(), [])
  })
  
  // Then populate with children
  categories.forEach(category => {
    if (category.parent) {
      const parentId = category.parent.toString()
      const children = categoryMap.get(parentId) || []
      children.push(category)
      categoryMap.set(parentId, children)
    }
  })

  const renderCategory = (category: ICategory, depth = 0) => {
    const categoryId = category._id.toString()
    const children = categoryMap.get(categoryId) || []
    const hasChildren = children.length > 0
    const isExpanded = expandedCategories.has(categoryId)
    
    // Calculate background color based on depth (lighter as depth increases)
    const bgColorClass = [
      'bg-primary/5',
      'bg-primary/10',
      'bg-primary/15',
      'bg-primary/20',
      'bg-primary/25',
    ][Math.min(depth, 4)]

    return (
      <div key={categoryId} className={`mb-2 rounded-md overflow-hidden border ${bgColorClass}`}>
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
                  <Link 
                    href={`/admin/categories/${categoryId}`} 
                    className="font-medium hover:underline text-primary"
                  >
                    {category.name}
                  </Link>
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
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Depth:</span> 
                  <span>{category.depth}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {formatDateTime(category.updatedAt).dateTime}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
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

  // Filter root categories (those without a parent)
  const rootCategories = categories.filter(c => !c.parent)
  
  // If there's a search query or we're on a pagination page, show all categories in a flat list
  // This ensures we display categories even when their parents might not be in the current page
  if (query || categories.length > 0) {
    return (
      <div className="space-y-2">
        {categories.map(category => renderCategory(category, category.depth))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rootCategories.map(category => renderCategory(category))}
    </div>
  )
}