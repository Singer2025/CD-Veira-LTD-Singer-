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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import dynamic from 'next/dynamic'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Info, Layers, Tag, Upload } from 'lucide-react'

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
import { z } from 'zod' // Keep z import for type inference

// Define the type based on the schemas
type CategoryFormValues = z.infer<typeof CategoryInputSchema>
type CategoryFormProps = {
  initialValues?: ICategory
}

export default function CategoryForm({ initialValues }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<ICategory[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories()
        // Filter out the current category if we're editing
        const filteredCategories = initialValues
          ? categoriesData.filter((cat) => cat._id && initialValues._id && cat._id.toString() !== initialValues._id.toString())
          : categoriesData
        setCategories(filteredCategories as unknown as ICategory[])
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

  // Add helper function to handle image uploads
  const handleImageUpload = async (file: { url: string }) => {
    try {
      // Verify the URL is accessible
      const response = await fetch(file.url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Image URL is not accessible');
      }
      return file.url;
    } catch (error) {
      console.error('Image verification failed:', error);
      toast({
        title: 'Image Upload Error',
        description: 'Failed to verify the uploaded image. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  async function onSubmit(values: CategoryFormValues) {
    try {
      setIsSubmitting(true);

      // Verify image URLs before submission
      if (values.image) {
        const verifiedImageUrl = await handleImageUpload({ url: values.image });
        if (!verifiedImageUrl) {
          setIsSubmitting(false);
          return;
        }
        values.image = verifiedImageUrl;
      }

      if (values.bannerImage) {
        const verifiedBannerUrl = await handleImageUpload({ url: values.bannerImage });
        if (!verifiedBannerUrl) {
          setIsSubmitting(false);
          return;
        }
        values.bannerImage = verifiedBannerUrl;
      }

      if (initialValues) {
        await updateCategory({
          id: initialValues._id ? initialValues._id.toString() : '',
          ...values,
          // Explicitly pass isParent property and only pass parent when needed
          isParent: values.isParent,
          parent: values.isParent ? undefined : values.parent,
          image: values.image || '',
          bannerImage: values.bannerImage,
          description: values.description,
          isFeatured: values.isFeatured,
        })
      } else {
        await createCategory({
          ...values,
          // Remove isParent property and only pass parent when needed
          parent: values.isParent ? undefined : values.parent,
          image: values.image || '',
          bannerImage: values.bannerImage,
          description: values.description,
          isFeatured: values.isFeatured,
        })
      }
      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Error submitting category form:', error)
      alert('Failed to save category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
              
              <FormField
                control={form.control}
                name="isParent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background hover:bg-accent/5 transition-colors">
                    <div className="space-y-1">
                      <FormLabel className="text-base">Category Type</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {field.value ? 'Parent category (top-level)' : 'Child category (select parent below)'}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue('parent', undefined);
                            form.clearErrors('parent');
                          }
                        }}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {!form.watch('isParent') && (
                <div className="mt-4 ml-4 border-l-2 pl-4 border-primary/20">
                  <FormField
                    control={form.control}
                    name='parent'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select parent category' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories
                              .filter(c => !c.parent) // Only show parent categories
                              .map((category) => (
                                <SelectItem 
                                  key={category._id ? category._id.toString() : 'no-id'} 
                                  value={category._id ? category._id.toString() : 'no-id'}
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
              )}
            </div>

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
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Category Image {form.watch('isParent') && <span className="text-destructive">*</span>}</FormLabel>
                        {form.watch('isParent') && (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                            Required for Parent
                          </span>
                        )}
                      </div>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value ? (
                            <div className="relative group">
                              <Image
                                src={field.value}
                                alt="Preview"
                                width={300}
                                height={150}
                                className="h-40 w-full object-contain rounded-md border bg-gray-50"
                              />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => {
                                    field.onChange('');
                                  }}
                                >
                                  Replace Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-40 flex items-center justify-center bg-gray-50 rounded-md border border-dashed">                              <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                  if (!res?.[0]?.url) {
                                    console.error('Upload completed but URL is missing');
                                    toast({
                                      title: "Upload Error",
                                      description: "Image upload completed but URL is missing",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  // Verify the image URL is accessible
                                  fetch(res[0].url, { method: 'HEAD' })
                                    .then(response => {
                                      if (!response.ok) {
                                        throw new Error(`Image verification failed: ${response.status}`);
                                      }
                                      field.onChange(res[0].url);
                                      toast({
                                        title: "Success",
                                        description: "Image uploaded successfully",
                                        variant: "default"
                                      });
                                    })
                                    .catch(error => {
                                      console.error('Image verification failed:', error);
                                      toast({
                                        title: "Upload Error",
                                        description: "Image upload completed but URL verification failed",
                                        variant: "destructive"
                                      });
                                    });
                                }}
                                onUploadError={(error: Error) => {
                                  console.error('Upload error:', error);
                                  toast({
                                    title: "Upload Error",
                                    description: error.message || "Image upload failed",
                                    variant: "destructive"
                                  })
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Banner Image Section */}
                <div className="pt-2">
                  {!form.watch('parent') ? (
                    <FormField
                      control={form.control}
                      name="bannerImage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Banner Image</FormLabel>
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              Parent Category
                            </span>
                          </div>
                          <FormControl>
                            <div className="space-y-4">
                              {field.value ? (
                                <div className="space-y-3">
                                  <div className="relative group">
                                    <Image
                                      src={field.value}
                                      alt="Banner Preview"
                                      width={300}
                                      height={150}
                                      className="h-40 w-full object-contain rounded-md border bg-gray-50"
                                    />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                      <Button 
                                        type="button" 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => {
                                          field.onChange('');
                                        }}
                                      >
                                        Replace Banner
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-700">
                                      This banner will be automatically inherited by all child categories.
                                      Child categories can optionally override this with their own banner.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-40 flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                                  <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                      field.onChange(res?.[0].url)
                                    }}
                                    onUploadError={(error: Error) => {
                                      console.error(error)
                                      toast({
                                        title: "Error",
                                        description: "Banner image upload failed",
                                        variant: "destructive"
                                      })
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FormLabel>Banner Image</FormLabel>
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                          Child Category
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {form.watch('bannerImage') ? (
                          <div className="space-y-3">
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md">
                              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-700">
                                You&apos;ve set a custom banner that will override the parent banner.
                                Remove the custom banner to inherit from parent.
                              </p>
                            </div>
                            <div className="relative group">
                              <Image
                                src={(form.watch('bannerImage') || '/placeholder-image.jpg')}
                                alt="Custom Banner Preview"
                                width={300}
                                height={150}
                                className="h-40 w-full object-contain rounded-md border bg-gray-50"
                              />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => form.setValue('bannerImage', '')}
                                >
                                  Remove Custom Banner
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-md">
                              <Info className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-green-700">
                                This category will inherit its banner from the parent category.
                                Upload a custom banner below to override this.
                              </p>
                            </div>
                            <div className="h-40 flex flex-col items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-300">
                              <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                  form.setValue('bannerImage', res?.[0].url)
                                }}
                                onUploadError={(error: Error) => {
                                  console.error(error)
                                  toast({
                                    title: "Error",
                                    description: "Banner image upload failed",
                                    variant: "destructive"
                                  })
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Attribute Templates
              </h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Define required attributes for products in this category. These will be automatically added to product forms when this category is selected.</p>
                
                {form.watch('attributeTemplates')?.map((attr, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div>
                      <FormLabel className={index !== 0 ? 'sr-only' : ''}>Attribute Name</FormLabel>
                      <Input
                        placeholder="Attribute name (e.g., Capacity)"
                        value={attr.name || ''}
                        onChange={(e) => {
                          const newAttrs = [...(form.watch('attributeTemplates') || [])];
                          newAttrs[index] = { ...newAttrs[index], name: e.target.value };
                          form.setValue('attributeTemplates', newAttrs);
                        }}
                      />
                    </div>
                    
                    <div>
                      <FormLabel className={index !== 0 ? 'sr-only' : ''}>Type</FormLabel>
                      <Select
                        value={attr.type || 'text'}
                        onValueChange={(value) => {
                          const newAttrs = [...(form.watch('attributeTemplates') || [])];
                          newAttrs[index] = { ...newAttrs[index], type: value };
                          form.setValue('attributeTemplates', newAttrs);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="select">Select (Options)</SelectItem>
                          <SelectItem value="boolean">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Required</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${index}`}
                            checked={attr.required || false}
                            onCheckedChange={(checked) => {
                              const newAttrs = [...(form.watch('attributeTemplates') || [])];
                              newAttrs[index] = { ...newAttrs[index], required: !!checked };
                              form.setValue('attributeTemplates', newAttrs);
                            }}
                          />
                          <label
                            htmlFor={`required-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Required
                          </label>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="mt-8"
                        onClick={() => {
                          const newAttrs = (form.watch('attributeTemplates') || []).filter((_, i) => i !== index);
                          form.setValue('attributeTemplates', newAttrs);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                    
                    {attr.type === 'select' && (
                      <div className="col-span-full">
                        <FormLabel>Options (comma separated)</FormLabel>
                        <Input
                          placeholder="Option 1, Option 2, Option 3"
                          value={(attr.options || []).join(', ')}
                          onChange={(e) => {
                            const options = e.target.value.split(',').map(opt => opt.trim()).filter(Boolean);
                            const newAttrs = [...(form.watch('attributeTemplates') || [])];
                            newAttrs[index] = { ...newAttrs[index], options };
                            form.setValue('attributeTemplates', newAttrs);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentAttrs = form.watch('attributeTemplates') || [];
                    form.setValue('attributeTemplates', [...currentAttrs, { name: '', type: 'text', options: [], required: false }]);
                  }}
                >
                  Add Attribute Template
                </Button>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Common attributes by category type:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <h5 className="font-medium">Appliances:</h5>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Dimensions</li>
                        <li>Energy Rating</li>
                        <li>Capacity</li>
                        <li>Warranty</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium">Furniture:</h5>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Dimensions</li>
                        <li>Material</li>
                        <li>Weight Capacity</li>
                        <li>Assembly Required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Additional Information</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter description" 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Category</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Featured categories will be highlighted throughout the site
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button 
              type='submit' 
              disabled={isSubmitting} 
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : initialValues ? 'Update Category' : 'Create Category'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}