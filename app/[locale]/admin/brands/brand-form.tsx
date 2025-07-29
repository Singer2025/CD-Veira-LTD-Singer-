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
import dynamic from 'next/dynamic'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tag, Upload } from 'lucide-react' // Removed unused AlertCircle, Info, Layers

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
import { IBrand } from '@/lib/db/models/brand.model'
import { createBrand, updateBrand } from '@/lib/actions/brand.actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toSlug } from '@/lib/utils'
import { BrandInputSchema, BrandUpdateSchema } from '@/lib/validator'
import { z } from 'zod' // Keep z import for type inference

// Define the type based on the schemas
type BrandFormValues = z.infer<typeof BrandInputSchema>
type BrandFormProps = {
  initialValues?: IBrand
}

export default function BrandForm({ initialValues }: BrandFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(initialValues ? BrandUpdateSchema : BrandInputSchema),
    defaultValues: {
      name: initialValues?.name || '',
      slug: initialValues?.slug || '',
      logo: initialValues?.logo || '',
      bannerImage: initialValues?.bannerImage || '',
      description: initialValues?.description || '',
      isFeatured: initialValues?.isFeatured || false,
      ...(initialValues ? { _id: initialValues._id } : {}),
    },
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue('name', name)
    if (!initialValues) {
      form.setValue('slug', toSlug(name))
    }
  }

  async function onSubmit(values: BrandFormValues) {
    console.log('Form submitted with values:', values);
    try {
      setIsSubmitting(true);
      console.log('Submission started');
      
      // Validate required fields
      if (!values.logo) {
        toast({
          title: 'Error',
          description: 'Brand logo is required',
          variant: 'destructive'
        })
        return
      }
      
      if (initialValues) {
        // Make sure we're passing the correct _id parameter
        const brandId = initialValues._id.toString();
        const { _id, ...submissionValues } = values; // Destructure _id
        
        // Add console log to debug the update request
        console.log('Updating brand with data:', {
          _id: brandId,
          ...submissionValues
        });
        
        console.log('Making updateBrand API call with:', {
          _id: brandId,
          ...submissionValues
        });
        
        try {
          const updateResult = await updateBrand({
            _id: brandId,
            ...submissionValues,
          });
          
          console.log('Update brand response:', updateResult);
          
          if (!updateResult) {
            throw new Error('No response received from updateBrand API');
          }
          
          if (updateResult.success === false) {
            console.error('Update failed with message:', updateResult.message);
            throw new Error(updateResult.message || 'Update failed');
          }

          // Show success toast before navigation
          toast({
            title: 'Brand Updated',
            description: updateResult.message || `Successfully updated brand: ${values.name}`,
          });
          
          // Navigate after successful update
          router.push('/admin/brands');
          router.refresh();
        } catch (error) {
          console.error('Update brand API call failed:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          throw error;
        }
        
      } else {
        // Add console log to debug the create request
        console.log('Creating brand with data:', values);
        
        const result = await createBrand(values);
        
        // Add console log to debug the create response
        console.log('Create brand response:', result);
        
        if (!result) {
          throw new Error('No response received from server')
        }
        
        if (!result.success) {
          toast({
            title: 'Creation Failed',
            description: result.message || 'Failed to create brand. Please check your data and try again.',
            variant: 'destructive'
          });
          return;
        }
        
        // Show success toast
        toast({
          title: 'Brand Created',
          description: result.message || `Successfully created brand: ${values.name}`,
        });
        
        // Navigate after successful creation
        router.push('/admin/brands');
        router.refresh();
      }
    } catch (error) {
      console.error('Error submitting brand form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save brand. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log('Form submit event triggered');
          console.log('Form errors:', form.formState.errors);
          console.log('Is form valid?', form.formState.isValid);
          form.handleSubmit(onSubmit)(e).catch(err => {
            console.error('Form submission error:', err);
          });
        }}
        className='space-y-8 max-w-3xl mx-auto'
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {initialValues ? 'Edit Brand' : 'Create New Brand'}
            </CardTitle>
            <CardDescription>
              Enter the basic information for this brand
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
                        placeholder='Enter brand name' 
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
                      <Input placeholder='Enter brand slug' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='Enter brand description' 
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
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Logo <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value ? (
                            <div className="relative group">
                              <Image
                                src={field.value}
                                alt="Logo Preview"
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
                                  Replace Logo
                                </Button>
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
                                  console.error('Upload error details:', {
                                    message: error.message,
                                    stack: error.stack,
                                    name: error.name
                                  });
                                  toast({
                                    title: "Upload Error",
                                    description: error.message || "Logo upload failed. Please check file size (max 8MB) and type (JPG/PNG).",
                                    variant: "destructive"
                                  })
                                }}
                                config={{
                                  mode: 'auto',
                                  appendOnPaste: true,
                                  maxFileCount: 1
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

                <FormField
                  control={form.control}
                  name="bannerImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value ? (
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
              </div>
            </div>

            <div className="pt-4">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background hover:bg-accent/5 transition-colors">
                    <div className="space-y-1">
                      <FormLabel className="text-base">Featured Brand</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Featured brands will be displayed prominently on the website
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type='submit'
              disabled={isSubmitting}
              className="w-full"
              onClick={() => console.log('Update button clicked')}
            >
              {isSubmitting ? 'Saving...' : initialValues ? 'Update Brand' : 'Create Brand'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}