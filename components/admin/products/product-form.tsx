'use client'

import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { getAllBrands } from '@/lib/actions/brand.actions'
import { getAllCategories } from '@/lib/actions/category.actions'
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Check, ChevronsUpDown, Plus, Trash, Upload, Package, Tag, Layers, DollarSign, Image as ImageIcon, Settings, Info, BarChart4, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UploadDropzone } from '@/lib/uploadthing'

// Sub-schemas
const dimensionSchema = z.object({
  height: z.coerce.number().positive('Height must be positive').optional(),
  width: z.coerce.number().positive('Width must be positive').optional(),
  depth: z.coerce.number().positive('Depth must be positive').optional(),
  unit: z.string().min(1, 'Unit is required').default('cm'),
}).optional()

const weightSchema = z.object({
  value: z.coerce.number().positive('Weight must be positive').optional(),
  unit: z.string().min(1, 'Unit is required').default('kg'),
}).optional()

const specificationSchema = z.object({
  title: z.string().min(1, 'Spec title cannot be empty'),
  value: z.string().min(1, 'Spec value cannot be empty'),
})

const variantAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  values: z.array(z.string().min(1, 'Value cannot be empty')),
})

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be positive').optional(),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative').optional(),
  attributes: z.array(z.object({
    name: z.string().min(1, 'Attribute name is required'),
    value: z.string().min(1, 'Value is required'),
  })),
  images: z.array(z.string().url('Must be a valid URL')).optional(),
})

// Main form schema
const productFormSchema = z.object({
  // Basic info
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }),
  sku: z.string().min(1, { message: 'SKU is required' }),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  
  // Physical attributes
  modelNumber: z.string().optional(),
  dimensions: dimensionSchema,
  weight: weightSchema,
  material: z.string().optional(),
  finish: z.string().optional(),
  capacity: z.string().optional(),
  
  // Energy & warranty
  energyRating: z.string().optional(),
  energyConsumption: z.string().optional(),
  warrantyDetails: z.string().optional(),
  installationRequired: z.boolean().default(false),
  
  // Pricing & inventory
  price: z.coerce.number().positive('Price must be positive').optional(),
  listPrice: z.coerce.number().positive('List price must be positive').optional(),
  countInStock: z.coerce.number().int().nonnegative('Stock cannot be negative').optional(),
  
  // Publishing
  isPublished: z.boolean().default(false),
  
  // Media & specs
  images: z.array(z.string().url('Must be a valid URL')).optional(),
  specifications: z.array(specificationSchema).optional(),
  
  // Variants
  hasVariants: z.boolean().default(false),
  variantAttributes: z.array(variantAttributeSchema).optional(),
  variants: z.array(variantSchema).optional(),
  
  // Tags
  tags: z.array(z.string()).default([]),
})

export default function ProductForm({ initialValues, type, product, productId }: { initialValues?: any, type?: string, product?: any, productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);
  const [brands, setBrands] = useState<Array<{_id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadedImages, setUploadedImages] = useState<string[]>((initialValues || product)?.images || []);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openBrandPopover, setOpenBrandPopover] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getAllCategories(),
          getAllBrands()
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues || product ? {
      // Basic info
      name: (initialValues || product)?.name || '',
      slug: (initialValues || product)?.slug || '',
      sku: (initialValues || product)?.sku || '',
      description: (initialValues || product)?.description || '',
      categoryId: (initialValues || product)?.category?._id || (initialValues || product)?.category || '',
      brandId: (initialValues || product)?.brand?._id || (initialValues || product)?.brand || '',
      
      // Physical attributes
      modelNumber: (initialValues || product)?.modelNumber || '',
      dimensions: (initialValues || product)?.dimensions || { height: undefined, width: undefined, depth: undefined, unit: 'cm' },
      weight: (initialValues || product)?.weight || { value: undefined, unit: 'kg' },
      material: (initialValues || product)?.material || '',
      finish: (initialValues || product)?.finish || '',
      capacity: (initialValues || product)?.capacity || '',
      
      // Energy & warranty
      energyRating: (initialValues || product)?.energyRating || '',
      energyConsumption: (initialValues || product)?.energyConsumption || '',
      warrantyDetails: (initialValues || product)?.warrantyDetails || '',
      installationRequired: (initialValues || product)?.installationRequired || false,
      
      // Pricing & inventory
      price: (initialValues || product)?.price,
      listPrice: (initialValues || product)?.listPrice,
      countInStock: (initialValues || product)?.countInStock,
      
      // Publishing
      isPublished: (initialValues || product)?.isPublished || false,
      
      // Media & specs
      images: (initialValues || product)?.images || [],
      specifications: (initialValues || product)?.specifications || [],
      
      // Variants
      hasVariants: (initialValues || product)?.hasVariants || false,
      variantAttributes: (initialValues || product)?.variantAttributes || [],
      variants: (initialValues || product)?.variants || [],
      
      // Tags
      tags: (initialValues || product)?.tags || [],
    } : {
      // Basic info
      name: '',
      slug: '',
      sku: '',
      description: '',
      categoryId: '',
      brandId: '',
      
      // Physical attributes
      modelNumber: '',
      dimensions: { height: undefined, width: undefined, depth: undefined, unit: 'cm' },
      weight: { value: undefined, unit: 'kg' },
      material: '',
      finish: '',
      capacity: '',
      
      // Energy & warranty
      energyRating: '',
      energyConsumption: '',
      warrantyDetails: '',
      installationRequired: false,
      
      // Pricing & inventory
      price: undefined,
      listPrice: undefined,
      countInStock: undefined,
      
      // Publishing
      isPublished: false,
      
      // Media & specs
      images: [],
      specifications: [],
      
      // Variants
      hasVariants: false,
      variantAttributes: [],
      variants: [],
      
      // Tags
      tags: [],
    },
  });
  
  // Field arrays for specifications and variants
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications"
  });
  
  const { fields: variantAttributeFields, append: appendVariantAttribute, remove: removeVariantAttribute } = useFieldArray({
    control: form.control,
    name: "variantAttributes"
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });
  
  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    form.setValue('slug', slug);
  };
  
  // Handle image upload from UploadThing
  const handleImageUpload = (res: any) => {
    console.log('handleImageUpload received:', res);
    try {
      if (Array.isArray(res)) {
        console.log('Processing', res.length, 'uploaded files');
        const urls = res.map(file => file.url || file.fileUrl || file.key);
        const validUrls = urls.filter(url => url && url.trim() !== '');
        
        if (validUrls.length === 0) {
          console.warn('No valid URLs found in upload response');
          return;
        }
        
        const newImages = [...uploadedImages, ...validUrls];
        console.log('New images array:', newImages);
        setUploadedImages(newImages);
        form.setValue('images', newImages);
      } else {
        console.warn('Invalid upload response format - expected array:', res);
      }
    } catch (error) {
      console.error('Error processing image upload:', error);
    }
  };
  
  // Handle image deletion
  const handleImageDelete = (url: string) => {
    const newImages = uploadedImages.filter(image => image !== url);
    setUploadedImages(newImages);
    form.setValue('images', newImages);
  };
  
  // Add a new variant attribute
  const addVariantAttribute = () => {
    if (!newAttributeName || !newAttributeValues) return;
    
    const values = newAttributeValues.split(',').map(v => v.trim()).filter(v => v);
    if (values.length === 0) return;
    
    appendVariantAttribute({
      name: newAttributeName,
      values: values
    });
    
    setNewAttributeName('');
    setNewAttributeValues('');
  };
  
  // Generate variants based on attributes
  const generateVariants = () => {
    const attributes = form.getValues('variantAttributes');
    if (!attributes || attributes.length === 0) return;
    
    // Get all possible combinations of attribute values
    const generateCombinations = (attrs: any[], index = 0, current: any[] = []) => {
      if (index === attrs.length) {
        return [current];
      }
      
      const combinations: any[] = [];
      const currentAttr = attrs[index];
      
      for (const value of currentAttr.values) {
        combinations.push(
          ...generateCombinations(
            attrs,
            index + 1,
            [...current, { name: currentAttr.name, value }]
          )
        );
      }
      
      return combinations;
    };
    
    const attrCombinations = generateCombinations(attributes);
    
    // Create variants for each combination
    const basePrice = form.getValues('price') || 0;
    const baseStock = form.getValues('countInStock') || 0;
    const baseSku = form.getValues('sku') || '';
    
    const newVariants = attrCombinations.map((attrCombo, index) => {
      const variantSuffix = attrCombo.map((a: any) => a.value.substring(0, 3)).join('-');
      return {
        sku: `${baseSku}-${variantSuffix}`,
        price: basePrice,
        stock: baseStock,
        attributes: attrCombo,
        images: []
      };
    });
    
    // Set the variants in the form
    form.setValue('variants', newVariants);
  };
  
  // Add a new tag
  const addTag = () => {
    if (!newTagInput) return;
    
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', [...currentTags, newTagInput]);
    setNewTagInput('');
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    try {
      setSubmitting(true);
      // Map form values to the expected format for the API
      const productData = {
        name: values.name,
        slug: values.slug,
        sku: values.sku, // Include SKU field
        category: values.categoryId,
        brand: values.brandId,
        description: values.description || '',
        price: values.price,
        listPrice: values.listPrice,
        countInStock: values.countInStock,
        images: uploadedImages, // Use the uploadedImages state to ensure images are saved
        isPublished: values.isPublished,
        tags: values.tags,
        specifications: values.specifications || [],
        // Physical attributes
        dimensions: values.dimensions,
        weight: values.weight,
        material: values.material,
        finish: values.finish,
        capacity: values.capacity,
        // Energy & warranty
        energyRating: values.energyRating,
        energyConsumption: values.energyConsumption,
        warrantyDetails: values.warrantyDetails,
        installationRequired: values.installationRequired,
        modelNumber: values.modelNumber,
      };
      
      // Call the API to create/update the product
      const result = initialValues 
        ? await updateProduct({ ...productData, _id: initialValues._id })
        : await createProduct(productData);
      
      if (result.success) {
        // Show success message and redirect
        alert('Product saved successfully!');
        // Redirect to products list
        router.push('/admin/products');
        router.refresh();
      } else {
        // Show error message
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Product Information</h1>
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Published</FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="basic" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Basic</span>
              </TabsTrigger>
              <TabsTrigger value="attributes" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Attributes</span>
              </TabsTrigger>
              <TabsTrigger value="specs" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Specifications</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="variants" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Variants</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Media</span>
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the essential details about your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} onChange={handleNameChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="product-slug" {...field} />
                          </FormControl>
                          <FormDescription>Auto-generated from name, but can be edited</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU-12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="modelNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter model number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Selector */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openCategoryPopover}
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={loading}
                                >
                                  {field.value
                                    ? (() => {
                                        const category = categories.find(cat => cat._id === field.value);
                                        if (!category) return "Select category...";
                                        
                                        let displayName = category.name;
                                        
                                        // Display full category hierarchy path
                                        if (category.path && Array.isArray(category.path) && category.path.length > 0) {
                                          const pathNames = category.path.map(pathId => {
                                            const pathCategory = categories.find(c => c._id === pathId);
                                            return pathCategory ? pathCategory.name : '';
                                          }).filter(Boolean);
                                          
                                          if (pathNames.length > 0) {
                                            displayName = [...pathNames, displayName].join(' / ');
                                          }
                                        }
                                        // Fallback to parent property if path is not available
                                        else if (category.parent) {
                                          // Try to find parent by ID
                                          const parentCategory = categories.find(c =>
                                            c._id === (typeof category.parent === 'string' ?
                                              category.parent : category.parent?.toString())
                                          );
                                          
                                          if (parentCategory) {
                                            displayName = `${parentCategory.name} / ${displayName}`;
                                          }
                                        }
                                        
                                        return displayName;
                                      })()
                                    : loading ? "Loading categories..." : "Select category..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandEmpty>No category found.</CommandEmpty>
                                <ScrollArea className="max-h-80">
                                  <CommandGroup>
                                    {/* Display parent categories first */}
                                    {categories
                                      .filter(cat => cat.isParent || cat.depth === 0 || !cat.parent)
                                      .map((parentCategory) => (
                                        <React.Fragment key={parentCategory._id}>
                                          <CommandItem
                                            value={parentCategory.name}
                                            onSelect={() => {
                                              form.setValue("categoryId", parentCategory._id);
                                              setOpenCategoryPopover(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                parentCategory._id === field.value ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {parentCategory.name}
                                          </CommandItem>
                                          
                                          {/* Display child categories indented */}
                                          {categories
                                            .filter(cat => {
                                              const catParentId = typeof cat.parent === 'string'
                                                ? cat.parent
                                                : cat.parent?.toString();
                                              return catParentId === parentCategory._id;
                                            })
                                            .map((childCategory) => (
                                              <CommandItem
                                                key={childCategory._id}
                                                value={childCategory.name}
                                                onSelect={() => {
                                                  form.setValue("categoryId", childCategory._id);
                                                  setOpenCategoryPopover(false);
                                                }}
                                                className="ml-4 border-l-2 pl-4 border-l-muted"
                                              >
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    childCategory._id === field.value ? "opacity-100" : "opacity-0"
                                                  )}
                                                />
                                                {childCategory.name}
                                                
                                                {/* Display third level categories (grandchildren) */}
                                                {categories
                                                  .filter(cat => {
                                                    const catParentId = typeof cat.parent === 'string'
                                                      ? cat.parent
                                                      : cat.parent?.toString();
                                                    return catParentId === childCategory._id;
                                                  })
                                                  .map((grandchildCategory) => (
                                                    <React.Fragment key={grandchildCategory._id}>
                                                      <CommandItem
                                                        value={grandchildCategory.name}
                                                        onSelect={() => {
                                                          form.setValue("categoryId", grandchildCategory._id);
                                                          setOpenCategoryPopover(false);
                                                        }}
                                                        className="ml-4 border-l-2 pl-4 border-l-muted"
                                                      >
                                                        <Check
                                                          className={cn(
                                                            "mr-2 h-4 w-4",
                                                            grandchildCategory._id === field.value ? "opacity-100" : "opacity-0"
                                                          )}
                                                        />
                                                        {grandchildCategory.name}
                                                      </CommandItem>
                                                      
                                                      {/* Display fourth level categories (great-grandchildren) */}
                                                      {categories
                                                        .filter(cat => {
                                                          const catParentId = typeof cat.parent === 'string'
                                                            ? cat.parent
                                                            : cat.parent?.toString();
                                                          return catParentId === grandchildCategory._id;
                                                        })
                                                        .map((greatGrandchildCategory) => (
                                                          <CommandItem
                                                            key={greatGrandchildCategory._id}
                                                            value={greatGrandchildCategory.name}
                                                            onSelect={() => {
                                                              form.setValue("categoryId", greatGrandchildCategory._id);
                                                              setOpenCategoryPopover(false);
                                                            }}
                                                            className="ml-8 border-l-2 pl-4 border-l-muted"
                                                          >
                                                            <Check
                                                              className={cn(
                                                                "mr-2 h-4 w-4",
                                                                greatGrandchildCategory._id === field.value ? "opacity-100" : "opacity-0"
                                                              )}
                                                            />
                                                            {greatGrandchildCategory.name}
                                                          </CommandItem>
                                                        ))}
                                                    </React.Fragment>
                                                  ))}
                                              </CommandItem>
                                            ))}
                                        </React.Fragment>
                                      ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Select a category to organize your product. Categories are displayed in a hierarchy.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    {/* Brand Selector */}
                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Popover open={openBrandPopover} onOpenChange={setOpenBrandPopover}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openBrandPopover}
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={loading}
                                >
                                  {field.value
                                    ? brands.find(brand => brand._id === field.value)?.name || "Select brand..."
                                    : loading ? "Loading brands..." : "Select brand..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Search brand..." />
                                <CommandEmpty>No brand found.</CommandEmpty>
                                <CommandGroup>
                                  {brands.map((brand) => (
                                    <CommandItem
                                      key={brand._id}
                                      value={brand.name}
                                      onSelect={() => {
                                        form.setValue("brandId", brand._id);
                                        setOpenBrandPopover(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === brand._id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {brand.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Physical Attributes Tab */}
            <TabsContent value="attributes" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Physical Attributes</CardTitle>
                  <CardDescription>Enter the physical characteristics of your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dimensions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="dimensions.height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Height" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dimensions.width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Width" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dimensions.depth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Depth</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Depth" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dimensions.unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cm">cm</SelectItem>
                                <SelectItem value="in">in</SelectItem>
                                <SelectItem value="ft">ft</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Weight</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weight.value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Weight" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight.unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Wood, Metal, Plastic" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="finish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Finish</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Matte, Glossy, Brushed" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 5L, 10 cu. ft." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Energy & Warranty</CardTitle>
                  <CardDescription>Enter energy ratings and warranty information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="energyRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Energy Rating</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. A+, Energy Star" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="energyConsumption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Energy Consumption</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 100 kWh/year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="warrantyDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter warranty information" 
                            className="min-h-20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="installationRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Installation Required</FormLabel>
                          <FormDescription>
                            Check if professional installation is required for this product
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Specifications Tab */}
            <TabsContent value="specs" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                  <CardDescription>Add detailed technical specifications for your product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {specFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-4">
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.title`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Specification</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Processor, RAM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Intel i7, 16GB" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSpec(index)}
                          className="mb-2"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => appendSpec({ title: '', value: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Specification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                  <CardDescription>Set pricing and inventory information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="listPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>List Price</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Regular price before any discounts</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Current selling price (optional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="countInStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>Create variations of your product (e.g. different colors, sizes)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="hasVariants"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This product has multiple variants</FormLabel>
                          <FormDescription>
                            Enable this if your product comes in different variations like sizes, colors, etc.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('hasVariants') && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Variant Attributes</h3>
                        <div className="space-y-4">
                          {variantAttributeFields.map((field, index) => (
                            <div key={field.id} className="flex flex-col space-y-4 p-4 border rounded-md">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">Attribute {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVariantAttribute(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormField
                                control={form.control}
                                name={`variantAttributes.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Attribute Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. Color, Size" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`variantAttributes.${index}.values`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Attribute Values</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                      {field.value.map((value, valueIndex) => (
                                        <Badge key={valueIndex} variant="secondary" className="text-sm py-1 px-2">
                                          {value}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => {
                                              const newValues = [...field.value];
                                              newValues.splice(valueIndex, 1);
                                              form.setValue(`variantAttributes.${index}.values`, newValues);
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </Badge>
                                      ))}
                                    </div>
                                    <FormDescription>
                                      Enter comma-separated values below and click Add
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}
                          
                          <div className="flex items-end gap-4 mt-4">
                            <div className="flex-1">
                              <FormLabel>New Attribute Name</FormLabel>
                              <Input 
                                placeholder="e.g. Color, Size" 
                                value={newAttributeName} 
                                onChange={(e) => setNewAttributeName(e.target.value)} 
                              />
                            </div>
                            <div className="flex-1">
                              <FormLabel>Values (comma separated)</FormLabel>
                              <Input 
                                placeholder="e.g. Red, Blue, Green" 
                                value={newAttributeValues} 
                                onChange={(e) => setNewAttributeValues(e.target.value)} 
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addVariantAttribute}
                              className="mb-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {variantAttributeFields.length > 0 && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={generateVariants}
                          >
                            Generate Variants
                          </Button>
                        </div>
                      )}
                      
                      {variantFields.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-4">Product Variants</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>SKU</TableHead>
                                  {form.watch('variantAttributes').map((attr) => (
                                    <TableHead key={attr.name}>{attr.name}</TableHead>
                                  ))}
                                  <TableHead>Price</TableHead>
                                  <TableHead>Stock</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {variantFields.map((field, index) => (
                                  <TableRow key={field.id}>
                                    <TableCell>
                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.sku`}
                                        render={({ field }) => (
                                          <FormItem className="m-0">
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>
                                    {form.watch(`variants.${index}.attributes`).map((attr, attrIndex) => (
                                      <TableCell key={attrIndex}>{attr.value}</TableCell>
                                    ))}
                                    <TableCell>
                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.price`}
                                        render={({ field }) => (
                                          <FormItem className="m-0">
                                            <FormControl>
                                              <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.stock`}
                                        render={({ field }) => (
                                          <FormItem className="m-0">
                                            <FormControl>
                                              <Input type="number" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeVariant(index)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload and manage product images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                        <Image 
                          src={url} 
                          alt={`Product image ${index + 1}`} 
                          fill 
                          className="object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleImageDelete(url)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border rounded-md p-4">
                    {/* Use key prop to force re-render of UploadDropzone when activeTab changes */}
                    {activeTab === 'media' && (
                      <UploadDropzone
                        key={`upload-dropzone-${Date.now()}`}
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          console.log('Upload complete - response:', res)
                          handleImageUpload(res)
                        }}
                        onUploadBegin={() => {
                          console.log('Upload started')
                        }}
                        onUploadProgress={(progress) => {
                          console.log('Upload progress:', progress)
                        }}
                        onUploadError={(error: Error) => {
                          console.error('Upload error:', error)
                          alert(`Upload failed: ${error.message}`)
                        }}
                        config={{
                          mode: "auto"
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tags Tab */}
            <TabsContent value="tags" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Tags</CardTitle>
                  <CardDescription>Add tags to help customers find your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.watch('tags').map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-2">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter a tag" 
                      value={newTagInput} 
                      onChange={(e) => setNewTagInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                    >
                      Add Tag
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
  
  useEffect(() => {
    // Add a useEffect to initialize the form with product data when in edit mode
    if (product && type === 'Update') {
      // Set uploaded images from product
      setUploadedImages(product.images || []);
      
      // Reset form with product data
      form.reset({
        // Basic info
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        description: product.description || '',
        categoryId: product.category?._id || product.category || '',
        brandId: product.brand?._id || product.brand || '',
        
        // Physical attributes
        modelNumber: product.modelNumber || '',
        dimensions: product.dimensions || { height: undefined, width: undefined, depth: undefined, unit: 'cm' },
        weight: product.weight || { value: undefined, unit: 'kg' },
        material: product.material || '',
        finish: product.finish || '',
        capacity: product.capacity || '',
        
        // Energy & warranty
        energyRating: product.energyRating || '',
        energyConsumption: product.energyConsumption || '',
        warrantyDetails: product.warrantyDetails || '',
        installationRequired: product.installationRequired || false,
        
        // Pricing & inventory
        price: product.price,
        listPrice: product.listPrice,
        countInStock: product.countInStock,
        
        // Publishing
        isPublished: product.isPublished || false,
        
        // Media & specs
        images: product.images || [],
        specifications: product.specifications || [],
        
        // Variants
        hasVariants: product.hasVariants || false,
        variantAttributes: product.variantAttributes || [],
        variants: product.variants || [],
        
        // Tags
        tags: product.tags || [],
      });
    }
  }, [product, type, form]);
}