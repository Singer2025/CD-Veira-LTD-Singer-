'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
// Removed unused import: Checkbox
import dynamic from 'next/dynamic'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Layers, Tag, Upload } from 'lucide-react' // Removed unused: AlertCircle, Info, ChevronRight

const UploadDropzone = dynamic(
  () => import('@/lib/uploadthing').then((mod) => mod.UploadDropzone),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 flex items-center justify-center bg-gray-100 rounded-md">
        Loading uploader...
      </div>
    )
  }
)
import { ICategory } from '@/lib/db/models/category.model'
import { createCategory, getAllCategories, updateCategory } from '@/lib/actions/category.actions'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toSlug } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CategoryInputSchema, CategoryUpdateSchema } from '@/lib/validator'
import { z } from 'zod'
// Removed unused import: ScrollArea
// Removed unused import: Badge

// Define the type based on the schemas
type CategoryFormValues = z.infer<typeof CategoryInputSchema>
type CategoryFormProps = {
  initialValues?: ICategory
}

// Define level names for better context
const LEVEL_NAMES = {
  0: 'Main Category',
  1: 'Sub-Category',
  2: 'Section',
  3: 'Sub-Section',
}

// Define level colors for visual hierarchy
const LEVEL_COLORS = {
  0: 'border-l-primary',
  1: 'border-l-blue-500',
  2: 'border-l-amber-500',
  3: 'border-l-green-500',
}

export default function EnhancedCategoryForm({ initialValues }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [hierarchyMap, setHierarchyMap] = useState<Map<string, ICategory[]>>(new Map())
  const [selectedLevel, setSelectedLevel] = useState<number>(initialValues?.depth || 0)
  const [uploadedImage, setUploadedImage] = useState<string>(initialValues?.image || '')
  const [uploadedBanner, setUploadedBanner] = useState<string>(initialValues?.bannerImage || '')
  // State for hierarchical selection (moved from renderCategorySelection)
  const [selectedLevel0, setSelectedLevel0] = useState<string | undefined>(
    initialValues?.path && initialValues.path.length > 0
      ? initialValues.path[0].toString()
      : undefined
  )
  const [selectedLevel1, setSelectedLevel1] = useState<string | undefined>(
    initialValues?.path && initialValues.path.length > 1
      ? initialValues.path[1].toString()
      : undefined
  )

  // Fetch all categories and build hierarchy map
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories()
        // Filter out the current category if we're editing
        const filteredCategories = initialValues
          ? categoriesData.filter((cat) => cat._id && initialValues._id && cat._id.toString() !== initialValues._id.toString())
          : categoriesData
        setCategories(filteredCategories as unknown as ICategory[])
        
        // Build hierarchy map
        const map = new Map<string, ICategory[]>()
        
        // Initialize with empty arrays for all possible parents
        filteredCategories.forEach((category: ICategory) => {
          map.set(category._id.toString(), [])
        })
        
        // Then populate with children
        filteredCategories.forEach((category: ICategory) => {
          if (category.parent) {
            const parentId = category.parent.toString()
            const children = map.get(parentId) || []
            children.push(category)
            map.set(parentId, children)
          }
        })
        
        setHierarchyMap(map)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [initialValues])

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(initialValues ? CategoryUpdateSchema : CategoryInputSchema),
    defaultValues: {
      name: initialValues?.name || '',
      slug: initialValues?.slug || '',
      isParent: initialValues?.isParent || false,
      parent: initialValues?.parent?.toString() || undefined,
      image: initialValues?.image || '',
      bannerImage: initialValues?.bannerImage || '',
      description: initialValues?.description || '',
      isFeatured: initialValues?.isFeatured || false,
      attributeTemplates: initialValues?.attributeTemplates || []
    },
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue('name', name)
    if (!initialValues) {
      form.setValue('slug', toSlug(name))
    }
  }

  // Handle image upload
  const handleImageUpload = (res: { url: string }[] | undefined) => {
    // Removed console logs
    if (res && Array.isArray(res) && res.length > 0) {
      const url = res[0].url;
      setUploadedImage(url);
      form.setValue('image', url);
    }
  }

  // Handle banner image upload
  const handleBannerUpload = (res: { url: string }[] | undefined) => {
    if (res && Array.isArray(res) && res.length > 0) {
      const url = res[0].url
      setUploadedBanner(url)
      form.setValue('bannerImage', url)
    }
  }

  // Get categories by depth level
  const getCategoriesByDepth = (depth: number) => {
    return categories.filter(cat => cat.depth === depth)
  }

  // Get children of a specific category
  const getChildrenOf = (categoryId: string) => {
    return hierarchyMap.get(categoryId) || []
  }

  // Handle level selection
  const handleLevelChange = (value: string) => {
    const level = parseInt(value)
    setSelectedLevel(level)
    
    // If level is 0, set isParent to true and clear parent
    if (level === 0) {
      form.setValue('isParent', true)
      form.setValue('parent', undefined)
    } else {
      form.setValue('isParent', false)
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    // Removed console logs
    try {
      setIsSubmitting(true);
      
      // Explicitly validate required fields
      const validationResult = await form.trigger(['name', 'slug', 'image', 'level'], { shouldFocus: true });
      
      if (!validationResult) {
        const errors = form.formState.errors;
        console.error('Validation failed:', errors);
        
        // Find the first error message to show
        const firstError =
          errors.name?.message ||
          errors.slug?.message ||
          errors.image?.message ||
          errors.level?.message ||
          'Please complete all required fields';
        
        toast({
          title: 'Validation Error',
          description: firstError,
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
      
      if (initialValues) {
        const updateData = {
          _id: initialValues._id ? initialValues._id.toString() : '',
          ...values,
          isParent: values.isParent,
          parent: values.isParent ? undefined : values.parent,
          image: values.image || '',
          bannerImage: values.bannerImage,
          description: values.description,
          isFeatured: values.isFeatured,
        };
        try {
          await updateCategory(updateData);
          // Removed console log
          
          // Show success toast
          toast({
            title: 'Category Updated',
            description: `Successfully updated category: ${values.name}`,
          });
          
          // Navigate after successful update
          router.push('/admin/categories');
          router.refresh();
        } catch (updateError) {
          console.error('Error in updateCategory call:', updateError);
          toast({
            title: 'Update Error',
            description: updateError instanceof Error ? updateError.message : 'Failed to update category. Please try again.',
            variant: 'destructive'
          });
          throw updateError; // Re-throw to be caught by the outer catch
        }
      } else {
        // Removed console log
        await createCategory({
          ...values,
          parent: values.isParent ? undefined : values.parent,
          image: values.image || '',
          bannerImage: values.bannerImage,
          description: values.description,
          isFeatured: values.isFeatured,
        });
        // Removed console log
        
        // Show success toast
        toast({
          title: 'Category Created',
          description: `Successfully created category: ${values.name}`,
        });
        
        // Navigate after successful creation
        router.push('/admin/categories');
        router.refresh();
      }
    } catch (error) {
      console.error('Error submitting category form:', error); // Reverted log message
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category. Please try again.',
        variant: 'destructive'
      });
    } finally {
      // Removed console log
      setIsSubmitting(false);
    }
  }

  // Render category selection based on level
  const renderCategorySelection = () => {
    if (selectedLevel === 0) {
      return null // No parent selection for top level
    }

    // For level 1, select from level 0 categories
    if (selectedLevel === 1) {
      const level0Categories = getCategoriesByDepth(0)
      return (
        <FormField
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {level0Categories.map((category) => (
                    <SelectItem 
                      key={category._id.toString()} 
                      value={category._id.toString()}
                      className={`border-l-4 ${LEVEL_COLORS[0]}`}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a main category as parent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }

    // For level 2, first select level 1 parent, which requires selecting level 0 first
    if (selectedLevel === 2) {
      const level0Categories = getCategoriesByDepth(0)
      // Use state defined at component level
      // const [selectedLevel0, setSelectedLevel0] = useState<string | undefined>( ... ) // Removed
      // Removed stray parenthesis from previous edit
      
      // Get level 1 categories that are children of selected level 0
      const level1Categories = selectedLevel0 
        ? getChildrenOf(selectedLevel0)
        : []

      return (
        <div className="space-y-4">
          <div>
            <FormLabel>Category Path</FormLabel>
            <FormDescription>
              Select the category path for this section
            </FormDescription>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level 0 selection */}
            <div>
              <FormLabel className="text-sm">Step 1: Select Main Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  setSelectedLevel0(value)
                  // Clear the parent when changing the level 0 selection
                  form.setValue('parent', undefined)
                }}
                value={selectedLevel0}
              >
                <SelectTrigger className={`border-l-4 ${LEVEL_COLORS[0]}`}>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {level0Categories.map((category) => (
                    <SelectItem 
                      key={category._id.toString()} 
                      value={category._id.toString()}
                      className={`border-l-4 ${LEVEL_COLORS[0]}`}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Level 1 selection (parent) */}
            <div>
              <FormLabel className="text-sm">Step 2: Select Sub-Category (Parent)</FormLabel>
              <FormField
                control={form.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedLevel0 || level1Categories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className={`border-l-4 ${LEVEL_COLORS[1]}`}>
                          <SelectValue placeholder={!selectedLevel0 ? "First select main category" : level1Categories.length === 0 ? "No sub-categories available" : "Select sub-category"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {level1Categories.map((category) => (
                          <SelectItem 
                            key={category._id.toString()} 
                            value={category._id.toString()}
                            className={`border-l-4 ${LEVEL_COLORS[1]}`}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      )
    }

    // For level 3, we need to select level 0, then level 1, then level 2 (parent)
    if (selectedLevel === 3) {
      const level0Categories = getCategoriesByDepth(0)
      // Use state defined at component level
      // const [selectedLevel0, setSelectedLevel0] = useState<string | undefined>( ... ) // Removed
      // Removed stray parenthesis from previous edit
      // Use state defined at component level
      // const [selectedLevel1, setSelectedLevel1] = useState<string | undefined>( ... ) // Removed
      
      // Get level 1 categories that are children of selected level 0
      const level1Categories = selectedLevel0 
        ? getChildrenOf(selectedLevel0)
        : []
      
      // Get level 2 categories that are children of selected level 1
      const level2Categories = selectedLevel1 
        ? getChildrenOf(selectedLevel1)
        : []

      return (
        <div className="space-y-4">
          <div>
            <FormLabel>Category Path</FormLabel>
            <FormDescription>
              Select the complete category path for this sub-section
            </FormDescription>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 0 selection */}
            <div>
              <FormLabel className="text-sm">Step 1: Select Main Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  setSelectedLevel0(value)
                  setSelectedLevel1(undefined)
                  form.setValue('parent', undefined)
                }}
                value={selectedLevel0}
              >
                <SelectTrigger className={`border-l-4 ${LEVEL_COLORS[0]}`}>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {level0Categories.map((category) => (
                    <SelectItem 
                      key={category._id.toString()} 
                      value={category._id.toString()}
                      className={`border-l-4 ${LEVEL_COLORS[0]}`}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Level 1 selection */}
            <div>
              <FormLabel className="text-sm">Step 2: Select Sub-Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  setSelectedLevel1(value)
                  form.setValue('parent', undefined)
                }}
                value={selectedLevel1}
                disabled={!selectedLevel0 || level1Categories.length === 0}
              >
                <SelectTrigger className={`border-l-4 ${LEVEL_COLORS[1]}`}>
                  <SelectValue placeholder={!selectedLevel0 ? "First select main category" : level1Categories.length === 0 ? "No sub-categories available" : "Select sub-category"} />
                </SelectTrigger>
                <SelectContent>
                  {level1Categories.map((category) => (
                    <SelectItem 
                      key={category._id.toString()} 
                      value={category._id.toString()}
                      className={`border-l-4 ${LEVEL_COLORS[1]}`}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Level 2 selection (parent) */}
            <div>
              <FormLabel className="text-sm">Step 3: Select Section (Parent)</FormLabel>
              <FormField
                control={form.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedLevel1 || level2Categories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className={`border-l-4 ${LEVEL_COLORS[2]}`}>
                          <SelectValue placeholder={!selectedLevel1 ? "First select sub-category" : level2Categories.length === 0 ? "No sections available" : "Select section"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {level2Categories.map((category) => (
                          <SelectItem 
                            key={category._id.toString()} 
                            value={category._id.toString()}
                            className={`border-l-4 ${LEVEL_COLORS[2]}`}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 max-w-3xl mx-auto'>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {initialValues ? 'Edit Category' : 'Create New Category'}
            </CardTitle>
            <CardDescription>
              Enter the basic information for this category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='Enter category name' 
                        {...field} 
                        onChange={handleNameChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter category slug' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Category Hierarchy
              </h3>
              <Separator className="mb-4" />
              
              <div className="space-y-6">
                {/* Level selection */}
                <div>
                  <FormLabel>Category Level</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {[0, 1, 2, 3].map((level) => (
                      <div 
                        key={level}
                        className={`
                          border rounded-md p-3 cursor-pointer transition-all
                          ${selectedLevel === level ? `border-l-4 ${LEVEL_COLORS[level]} bg-primary/5` : 'hover:bg-accent/5'}
                        `}
                        onClick={() => handleLevelChange(level.toString())}
                      >
                        <div className="font-medium">{LEVEL_NAMES[level as keyof typeof LEVEL_NAMES]}</div>
                        <div className="text-xs text-muted-foreground mt-1">Level {level}</div>
                      </div>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    Select the level in the category hierarchy (up to 4 levels deep)
                  </FormDescription>
                </div>

                {/* Parent category selection based on level */}
                {renderCategorySelection()}
              </div>
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='Enter category description' 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Images
              </h3>
              <Separator className="mb-4" />
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => ( // Removed unused 'field' parameter
                    <FormItem>
                      <FormLabel>Category Image <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {uploadedImage && uploadedImage !== '/images/default-category.png' ? (
                            // Only render Image if uploadedImage exists and is not the default path
                            <div className="relative group">
                              <Image
                                src={uploadedImage}
                                alt="Image Preview"
                                width={300}
                                height={150}
                                className="h-40 w-full object-contain rounded-md border bg-gray-50"
                                // Add onError to handle potential future image load errors gracefully
                                onError={(e) => {
                                  console.warn(`Failed to load category image: ${uploadedImage}`, e);
                                  setUploadedImage(''); // Clear state if image fails to load
                                  form.setValue('image', '');
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setUploadedImage('');
                                    form.setValue('image', '');
                                  }}
                                >
                                  Remove Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Render a simple placeholder if no valid image is set
                            <div className="h-40 w-full flex items-center justify-center text-sm text-muted-foreground bg-gray-50 rounded-md border">
                              No image uploaded
                            </div>
                          )}
                          {/* The UploadDropzone is now rendered below, outside the conditional */}
                          {/* Always render UploadDropzone if no valid image is displayed */}
                          {!uploadedImage || uploadedImage === '/images/default-category.png' ? (
                            <UploadDropzone
                              endpoint="imageUploader" // Corrected endpoint name
                              onClientUploadComplete={handleImageUpload}
                              onUploadError={(error: Error) => {
                                console.error('Upload error:', error)
                                toast({
                                  title: 'Upload Error',
                                  description: error.message || 'Failed to upload image',
                                  variant: 'destructive'
                                })
                              }}
                            />
                          ) : null}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a representative image for this category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bannerImage"
                  render={() => ( // Removed unused 'field' parameter
                    <FormItem>
                      <FormLabel>Banner Image (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {uploadedBanner ? (
                            <div className="relative group">
                              <Image
                                src={uploadedBanner}
                                alt="Banner Preview"
                                width={600}
                                height={200}
                                className="h-40 w-full object-cover rounded-md border bg-gray-50"
                              />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => {
                                    setUploadedBanner('')
                                    form.setValue('bannerImage', '')
                                  }}
                                >
                                  Remove Banner
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <UploadDropzone
                              endpoint="categoryBanner"
                              onClientUploadComplete={handleBannerUpload}
                              onUploadError={(error: Error) => {
                                console.error('Upload error:', error)
                                toast({
                                  title: 'Upload Error',
                                  description: error.message || 'Failed to upload banner',
                                  variant: 'destructive'
                                })
                              }}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a banner image to be displayed at the top of the category page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background hover:bg-accent/5 transition-colors">
                  <div className="space-y-1">
                    <FormLabel className="text-base">Featured Category</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Featured categories are prominently displayed on the homepage
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/admin/categories')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialValues ? 'Update Category' : 'Create Category'}
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      {/* Debug button - can be removed later */}
      <div className="mt-8 p-4 border rounded-lg bg-yellow-50">
        <h3 className="font-medium mb-2">Debug Controls</h3>
        <Button
          variant="outline"
          onClick={async () => {
            const values = form.getValues();
            if (initialValues) {
              values._id = initialValues._id.toString();
            }
            await onSubmit(values);
          }}
        >
          Test Submit Manually
        </Button>
        <div className="mt-2 text-sm">
          <p>Form values: {JSON.stringify(form.watch())}</p>
          <p>Form errors: {JSON.stringify(form.formState.errors)}</p>
          <p>Is submitting: {String(form.formState.isSubmitting)}</p>
        </div>
      </div>
    </Form>
  )
}