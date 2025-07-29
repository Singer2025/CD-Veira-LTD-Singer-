'use client'

import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getAllBrands } from '@/lib/actions/brand.actions'
import { getAllCategories } from '@/lib/actions/category.actions'
import { createProduct, updateProduct, getAllTags } from '@/lib/actions/product.actions'
import { useToast } from '@/hooks/use-toast'
import FulfillmentOptions from '@/components/shared/product/fulfillment-options'
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
// Remove unused import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
// Remove unused import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Check, ChevronsUpDown, Plus, Trash, Package, Tag, Layers, DollarSign, Image as ImageIcon, Settings, Info, X, Truck, Box } from 'lucide-react'
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
  price: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive('Price must be positive').optional()),
  stock: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().nonnegative('Stock cannot be negative').optional()),
  attributes: z.array(z.object({
    name: z.string().min(1, 'Attribute name is required'),
    value: z.string().min(1, 'Value is required'),
  })),
  images: z.array(z.string().url('Must be a valid URL')).optional(),
})

// Delivery method schema
const deliveryMethodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Delivery method name is required'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  estimatedDays: z.string().optional(),
  isDefault: z.boolean().optional().default(false)
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

  // New fields for product page redesign
  videoUrls: z.array(z.string().url('Must be a valid URL')).optional(),
  customerImageUrls: z.array(z.string().url('Must be a valid URL')).optional(),
  specialOffers: z.array(z.string()).optional(),
  returnPolicyText: z.string().optional(),
  
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
  
  // Fulfillment options
  isShippable: z.boolean().default(true),
  isPickupAvailable: z.boolean().default(false),
  
  // Pricing & inventory
  price: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive('Price must be positive').optional()),
  listPrice: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive('List price must be positive').optional()),
  countInStock: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().nonnegative('Stock cannot be negative').optional()),
  
  // Publishing
  isPublished: z.boolean().default(false),
  
  // Media & specs
  images: z.array(z.string().url('Must be a valid URL')).optional(),
  specifications: z.array(specificationSchema).optional(),
  
  // Variants
  hasVariants: z.boolean().default(false),
  variantAttributes: z.array(variantAttributeSchema).optional(),
  variants: z.array(variantSchema).optional(),
  
  // Delivery methods
  deliveryMethods: z.array(deliveryMethodSchema).optional().default([]),
  
  // Tags
  tags: z.array(z.string()).default([]),
})

interface ProductFormProps {
  initialValues?: Partial<z.infer<typeof productFormSchema>>
  product?: z.infer<typeof productFormSchema> & { _id: string }
}

export default function ProductForm({ initialValues, product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);
  const [brands, setBrands] = useState<Array<{_id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [, setActiveTab] = useState('basic');
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialValues?.images || []);
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
          getAllBrands(),
          getAllTags()
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
        const tagsData = await getAllTags();
        setAllTags(tagsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Initialize uploaded images when product data is available
  useEffect(() => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      setUploadedImages(product.images);
    }
  }, [product?.images]);
  
  const form = useForm<z.infer<typeof productFormSchema>>({    
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues || product ? {
      // Basic info
      name: (initialValues || product)?.name || '',
      slug: (initialValues || product)?.slug || '',
      sku: (initialValues || product)?.sku || '',
      description: (initialValues || product)?.description || '',
      categoryId: (initialValues || product)?.categoryId || '',
      brandId: (initialValues || product)?.brandId || '',
      
      // Physical attributes
      modelNumber: (initialValues || product)?.modelNumber || '',
      dimensions: (initialValues || product)?.dimensions ? {
        height: (initialValues || product)?.dimensions?.height ?? undefined,
        width: (initialValues || product)?.dimensions?.width ?? undefined,
        depth: (initialValues || product)?.dimensions?.depth ?? undefined,
        unit: (initialValues || product)?.dimensions?.unit || 'cm',
      } : undefined,
      weight: (initialValues || product)?.weight ? {
        value: (initialValues || product)?.weight?.value ?? undefined,
        unit: (initialValues || product)?.weight?.unit || 'kg',
      } : undefined,
      material: (initialValues || product)?.material || '',
      finish: (initialValues || product)?.finish || '',
      capacity: (initialValues || product)?.capacity || '',
      
      // Energy & warranty
      energyRating: (initialValues || product)?.energyRating || '',
      energyConsumption: (initialValues || product)?.energyConsumption || '',
      warrantyDetails: (initialValues || product)?.warrantyDetails || '',
      installationRequired: (initialValues || product)?.installationRequired || false,
      
      // Fulfillment options
      isShippable: (initialValues || product)?.isShippable ?? true,
      isPickupAvailable: (initialValues || product)?.isPickupAvailable ?? false,
      
      // Pricing & inventory - initialize numeric fields with numbers or undefined
      price: (initialValues || product)?.price !== undefined ? Number((initialValues || product)?.price) : undefined,
      listPrice: (initialValues || product)?.listPrice !== undefined ? Number((initialValues || product)?.listPrice) : undefined,
      countInStock: (initialValues || product)?.countInStock !== undefined ? Number((initialValues || product)?.countInStock) : undefined,
      
      // Publishing
      isPublished: (initialValues || product)?.isPublished || false,
      
      // Media & specs
      images: (initialValues || product)?.images || [],
      specifications: (initialValues || product)?.specifications || [],
      
      // Variants
      hasVariants: (initialValues || product)?.hasVariants || false,
      variantAttributes: (initialValues || product)?.variantAttributes || [],
      variants: ((initialValues || product)?.variants || []).map(v => ({
        ...v,
        price: v.price !== undefined ? Number(v.price) : undefined,
        stock: v.stock !== undefined ? Number(v.stock) : undefined,
      })),
      
      // Tags
      tags: (initialValues || product)?.tags || [],

      // Delivery methods
      deliveryMethods: (initialValues || product)?.deliveryMethods || [],

      // New fields for product page redesign
    videoUrls: (initialValues || product)?.videoUrls || [],
    customerImageUrls: (initialValues || product)?.customerImageUrls || [],
    returnPolicyText: (initialValues || product)?.returnPolicyText || '',
    } : {
      // Basic info
      name: '',
      slug: '',
      sku: '',
      description: '',
      categoryId: '',
      brandId: '',
      
      // New fields for product page redesign
    videoUrls: [],
    customerImageUrls: [],
    returnPolicyText: '',
      
      // Physical attributes
      modelNumber: '',
      dimensions: undefined,
      weight: undefined,
      material: '',
      finish: '',
      capacity: '',
      
      // Energy & warranty
      energyRating: '',
      energyConsumption: '',
      warrantyDetails: '',
      installationRequired: false,
      
      // Pricing & inventory - use empty string instead of undefined
      price: '',
      listPrice: '',
      countInStock: '',
      
      // Publishing
      isPublished: false,
      
      // Media & specs
      images: [],
      specifications: [],
      
      // Variants
      hasVariants: false,
      variantAttributes: [],
      variants: [], // New product starts with no variants, so no change needed here
      
      // Tags
      tags: [],

      // New fields for product page redesign (already covered by the block above, this is for the 'new product' case)
    },
  });
  
  // Reset form with product data when editing and after categories/brands are loaded
  useEffect(() => {
    if (product && !loading) {
      console.log('Resetting form with product data:', product);
      
      // Use dimensions and weight directly
      const dimensionsValue = product.dimensions;
      const weightValue = product.weight;
      
      // Use categoryId directly
      let categoryId = product.categoryId || '';
      
      // Reset form with properly formatted product data
      form.reset({
        // Basic info
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        description: product.description || '',
        categoryId: categoryId,
        brandId: product.brandId || '',
        
        // Physical attributes
        modelNumber: product.modelNumber || '',
        dimensions: dimensionsValue,
        weight: weightValue,
        material: product.material || '',
        finish: product.finish || '',
        capacity: product.capacity || '',
        
        // Energy & warranty
        energyRating: product.energyRating || '',
        energyConsumption: product.energyConsumption || '',
        warrantyDetails: product.warrantyDetails || '',
        installationRequired: product.installationRequired || false,
        
        // Pricing & inventory - ensure numeric values are properly handled
        price: product.price?.toString() ?? '',
        listPrice: product.listPrice?.toString() ?? '',
        countInStock: product.countInStock?.toString() ?? '',
        
        // Publishing
        isPublished: product.isPublished || false,
        
        // Media & specs
        images: product.images || [],
        specifications: product.specifications || [],
        
        // Variants
        hasVariants: product.hasVariants || false,
        variantAttributes: product.variantAttributes || [],
        variants: (product.variants || []).map(v => ({
          ...v,
          price: v.price?.toString() ?? '',
          stock: v.stock?.toString() ?? '',
        })),
        
        // Tags
        tags: product.tags || [],

        // New fields for product page redesign
      videoUrls: product?.videoUrls || [],
      customerImageUrls: product?.customerImageUrls || [],
      returnPolicyText: product?.returnPolicyText || '',
      }, { keepDefaultValues: false });
      
      // Log the form values after reset for debugging
      console.log('Form values after reset:', form.getValues());
    }
  }, [product, loading, form]);
  
  // Field arrays for specifications and variants
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications"
  });
  
  const { fields: variantAttributeFields, append: appendVariantAttribute, remove: removeVariantAttribute } = useFieldArray({
    control: form.control,
    name: "variantAttributes"
  });
  
  const { fields: variantFields, remove: removeVariant } = useFieldArray({
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
  const handleImageUpload = (res: Array<{url: string}>) => {
    if (res && Array.isArray(res)) {
      const urls = res.map((file) => file.url);
      const newImages = [...uploadedImages, ...urls];
      setUploadedImages(newImages);
      form.setValue('images', newImages);
      
      // Show success toast for bulk upload
      if (res.length > 1) {
        alert(`Successfully uploaded ${res.length} images`);
      }
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
    const generateCombinations = (attrs: typeof variantAttributeFields, index = 0, current: typeof variantFields[0]['attributes'] = []) => {
      if (index === attrs.length) {
        return [current];
      }
      
      const combinations: typeof variantFields[0]['attributes'][] = [];
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
    
    const newVariants = attrCombinations.map((attrCombo) => {
      const variantSuffix = attrCombo.map((a) => a.value.substring(0, 3)).join('-');
      return {
        sku: `${baseSku}-${variantSuffix}`,
        price: basePrice.toString(), // Ensure basePrice is a string
        stock: baseStock.toString(), // Ensure baseStock is a string
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
      console.log('Form values:', values);
      console.log('Uploaded images:', uploadedImages);
      
      // Validate required fields
      if (!values.categoryId || !values.brandId) {
        toast({
          variant: 'destructive',
          description: 'Category and brand are required'
        });
        setSubmitting(false);
        return;
      }
      
      // Dimensions and weight are already in the correct format from the form

      // Map form values to the expected format for the API
      const productData = {
        name: values.name,
        slug: values.slug,
        sku: values.sku, // Add SKU field to ensure it's saved
        categoryId: values.categoryId,
        brandId: values.brandId,
        description: values.description || '',
        price: values.price === '' ? undefined : parseFloat(values.price), // Convert empty string to undefined
        listPrice: values.listPrice === '' ? undefined : parseFloat(values.listPrice), // Convert empty string to undefined
        countInStock: values.countInStock === '' ? undefined : parseInt(values.countInStock, 10), // Convert empty string to undefined
        images: uploadedImages, // Use the uploadedImages state to ensure images are saved
        isPublished: values.isPublished,
        tags: values.tags || [],
        specifications: values.specifications || [],
        // Physical attributes
        dimensions: values.dimensions,
        weight: values.weight,
        material: values.material || '',
        finish: values.finish || '',
        capacity: values.capacity || '',
        // Energy & warranty
        energyRating: values.energyRating || '',
        energyConsumption: values.energyConsumption || '',
        warrantyDetails: values.warrantyDetails || '',
        installationRequired: values.installationRequired || false,
        modelNumber: values.modelNumber || '',
        // Ensure we're passing all required fields for update
        avgRating: product?.avgRating || 0,
        numReviews: product?.numReviews || 0,
        numSales: product?.numSales || 0,
        // New fields for product page redesign
        videoUrls: values.videoUrls || [],
        customerImageUrls: values.customerImageUrls || [],
        specialOffers: values.specialOffers || [],
        returnPolicyText: values.returnPolicyText || '',
        // Delivery methods
        deliveryMethods: values.deliveryMethods || [],
        ratingDistribution: product?.ratingDistribution || [
          { rating: 1, count: 0 },
          { rating: 2, count: 0 },
          { rating: 3, count: 0 },
          { rating: 4, count: 0 },
          { rating: 5, count: 0 }
        ]
      };
      
      // Call the API to create/update the product
      const result = product
        ? await updateProduct({ ...productData, _id: product._id })
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
                                        if (!category) return loading ? "Loading categories..." : "Select category...";
                                        
                                        // Display full category path if available
                                        let displayName = category.name;
                                        if (category.path && category.path.length > 0) {
                                          // Build path from all ancestors
                                          const pathNames = category.path.map(pathId => {
                                            const pathCategory = categories.find(c => 
                                              c._id === (typeof pathId === 'string' ? pathId : pathId.toString())
                                            );
                                            return pathCategory ? pathCategory.name : '';
                                          }).filter(Boolean);
                                          
                                          if (pathNames.length > 0) {
                                            displayName = [...pathNames, category.name].join(' / ');
                                          }
                                        } else if (category.parent) {
                                          // Fallback to just parent/child display
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
                                <CommandGroup className="max-h-[400px] overflow-auto">
                                  {/* Level 0 categories (Main) */}
                                  {categories
                                    .filter(cat => cat.depth === 0 || cat.isParent || !cat.parent)
                                    .map((mainCategory) => (
                                      <React.Fragment key={mainCategory._id}>
                                        <CommandItem
                                          value={mainCategory.name}
                                          onSelect={() => {
                                            form.setValue("categoryId", mainCategory._id);
                                            setOpenCategoryPopover(false);
                                          }}
                                          className="font-medium border-l-4 border-l-primary"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              mainCategory._id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {mainCategory.name}
                                        </CommandItem>
                                        
                                        {/* Level 1 categories (Sub-categories) */}
                                        {categories
                                          .filter(cat => {
                                            const catParentId = typeof cat.parent === 'string' 
                                              ? cat.parent 
                                              : cat.parent?.toString();
                                            return catParentId === mainCategory._id.toString();
                                          })
                                          .map((subCategory) => (
                                            <React.Fragment key={subCategory._id}>
                                              <CommandItem
                                                value={subCategory.name}
                                                onSelect={() => {
                                                  form.setValue("categoryId", subCategory._id);
                                                  setOpenCategoryPopover(false);
                                                }}
                                                className="pl-6 text-sm border-l-4 border-l-blue-500"
                                              >
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    subCategory._id === field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  )}
                                                />
                                                {subCategory.name}
                                              </CommandItem>
                                              
                                              {/* Level 2 categories (Sections) */}
                                              {categories
                                                .filter(cat => {
                                                  const catParentId = typeof cat.parent === 'string' 
                                                    ? cat.parent 
                                                    : cat.parent?.toString();
                                                  return catParentId === subCategory._id.toString();
                                                })
                                                .map((sectionCategory) => (
                                                  <React.Fragment key={sectionCategory._id}>
                                                    <CommandItem
                                                      value={sectionCategory.name}
                                                      onSelect={() => {
                                                        form.setValue("categoryId", sectionCategory._id);
                                                        setOpenCategoryPopover(false);
                                                      }}
                                                      className="pl-10 text-sm border-l-4 border-l-amber-500"
                                                    >
                                                      <Check
                                                        className={cn(
                                                          "mr-2 h-4 w-4",
                                                          sectionCategory._id === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                        )}
                                                      />
                                                      {sectionCategory.name}
                                                    </CommandItem>
                                                    
                                                    {/* Level 3 categories (Sub-sections) */}
                                                    {categories
                                                      .filter(cat => {
                                                        const catParentId = typeof cat.parent === 'string' 
                                                          ? cat.parent 
                                                          : cat.parent?.toString();
                                                        return catParentId === sectionCategory._id.toString();
                                                      })
                                                      .map((subSectionCategory) => (
                                                        <CommandItem
                                                          key={subSectionCategory._id}
                                                          value={subSectionCategory.name}
                                                          onSelect={() => {
                                                            form.setValue("categoryId", subSectionCategory._id);
                                                            setOpenCategoryPopover(false);
                                                          }}
                                                          className="pl-14 text-sm border-l-4 border-l-green-500"
                                                        >
                                                          <Check
                                                            className={cn(
                                                              "mr-2 h-4 w-4",
                                                              subSectionCategory._id === field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                            )}
                                                          />
                                                          {subSectionCategory.name}
                                                        </CommandItem>
                                                      ))
                                                    }
                                                  </React.Fragment>
                                                ))
                                              }
                                            </React.Fragment>
                                          ))
                                        }
                                      </React.Fragment>
                                    ))
                                  }
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Select a category to organize your product. Categories are displayed in a hierarchy up to 4 levels deep.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                      )}
                    />
                  </div>
                  
                  {/* Higher Purchase Information section is only in the pricing tab */}
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
                  
                  <Card className="mt-6 border-2 border-gray-200">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Truck className="h-5 w-5 text-gray-600" />
                        Fulfillment Options
                      </CardTitle>
                      <CardDescription>
                        Configure how this product can be delivered to customers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Legacy Fulfillment Options */}
                      <div className="grid gap-6">
                        <FormField
                          control={form.control}
                          name="isShippable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-green-50 border-green-100">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-green-600"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-green-800 font-medium">Available for Shipping (Legacy)</FormLabel>
                                <FormDescription className="text-green-700">
                                  Enable if this product can be shipped to customers&apos; addresses
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isPickupAvailable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50 border-blue-100">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-blue-800 font-medium">Available for In-Store Pickup (Legacy)</FormLabel>
                                <FormDescription className="text-blue-700">
                                  Enable if customers can pick up this product at physical store locations
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* New Delivery Methods Section */}
                      <div className="mt-8 border-t pt-6">
                        <h3 className="text-base font-medium mb-4">Delivery Methods</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Configure specific delivery methods available for this product. Customers will be able to select from these options on the product page.
                        </p>
                        
                        {/* Delivery Methods List */}
                        <div className="space-y-4">
                          {form.watch('deliveryMethods')?.map((method, index) => (
                            <div key={method.id || index} className="border rounded-md p-4 bg-white">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                  {method.icon === 'truck' ? (
                                    <Truck className="h-5 w-5 text-blue-600" />
                                  ) : method.icon === 'package' ? (
                                    <Package className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Box className="h-5 w-5 text-gray-600" />
                                  )}
                                  <h4 className="font-medium">{method.name || 'New Delivery Method'}</h4>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updatedMethods = [...form.getValues('deliveryMethods')];
                                    updatedMethods.splice(index, 1);
                                    form.setValue('deliveryMethods', updatedMethods);
                                  }}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name={`deliveryMethods.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Method Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. Standard Shipping" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`deliveryMethods.${index}.icon`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Icon</FormLabel>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select an icon" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="truck">
                                            <div className="flex items-center gap-2">
                                              <Truck className="h-4 w-4" />
                                              <span>Truck (Shipping)</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="package">
                                            <div className="flex items-center gap-2">
                                              <Package className="h-4 w-4" />
                                              <span>Package (Pickup)</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="box">
                                            <div className="flex items-center gap-2">
                                              <Box className="h-4 w-4" />
                                              <span>Box (Other)</span>
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="mt-4">
                                <FormField
                                  control={form.control}
                                  name={`deliveryMethods.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. Delivery within 3-5 business days" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid gap-4 md:grid-cols-2 mt-4">
                                <FormField
                                  control={form.control}
                                  name={`deliveryMethods.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="0" 
                                          step="0.01" 
                                          placeholder="0.00" 
                                          {...field} 
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormDescription>Leave at 0 for free delivery</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`deliveryMethods.${index}.estimatedDays`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Estimated Delivery Time</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. 3-5 days" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="mt-4">
                                <FormField
                                  control={form.control}
                                  name={`deliveryMethods.${index}.isDefault`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={(checked) => {
                                            // If this is being set as default, unset any other defaults
                                            if (checked) {
                                              const methods = [...form.getValues('deliveryMethods')];
                                              methods.forEach((m, i) => {
                                                if (i !== index) {
                                                  form.setValue(`deliveryMethods.${i}.isDefault`, false);
                                                }
                                              });
                                            }
                                            field.onChange(checked);
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Default Option</FormLabel>
                                        <FormDescription>
                                          This will be pre-selected for customers
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                          
                          {/* Add Method Button */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => {
                              const currentMethods = form.getValues('deliveryMethods') || [];
                              const newMethod = {
                                id: `method-${Date.now()}`,
                                name: '',
                                description: '',
                                icon: 'truck',
                                price: 0,
                                estimatedDays: '',
                                isDefault: currentMethods.length === 0 // Make default if it's the first one
                              };
                              form.setValue('deliveryMethods', [...currentMethods, newMethod]);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Delivery Method
                          </Button>
                        </div>
                      </div>
                      
                      {/* Preview Section */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                        <div className="p-3 bg-white rounded border">
                          {form.watch('deliveryMethods')?.length > 0 ? (
                            <div className="space-y-2">
                              {form.watch('deliveryMethods').map((method, index) => (
                                <div key={method.id || index} className="flex items-center gap-2 text-sm">
                                  {method.icon === 'truck' ? (
                                    <Truck className="h-4 w-4 text-blue-600" />
                                  ) : method.icon === 'package' ? (
                                    <Package className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Box className="h-4 w-4 text-gray-600" />
                                  )}
                                  <span className="font-medium">{method.name || 'Unnamed Method'}</span>
                                  {method.isDefault && (
                                    <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No delivery methods configured. Using legacy options:
                              <FulfillmentOptions 
                                product={{
                                  isShippable: form.watch('isShippable'),
                                  isPickupAvailable: form.watch('isPickupAvailable')
                                }}
                                showAsBadges={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  
                  {/* Note: Higher Purchase Information is ONLY in the Pricing tab to avoid duplicate React keys */}
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
                  
                  {/* Higher Purchase Information section removed as per requirements */}
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
                                              <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                              />
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
                                              <Input
                                                type="number"
                                                {...field}
                                                value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                              />
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
                    <UploadDropzone
                      endpoint="imageUploader"
                      onClientUploadComplete={handleImageUpload}
                      onUploadError={(error: Error) => {
                        console.error(error);
                        alert(`Upload failed: ${error.message}`);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Product Page Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Product Page Features
                  </CardTitle>
                  <CardDescription>Additional media and information for the product page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video URLs */}
                  <FormField
                    control={form.control}
                    name="videoUrls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Videos</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter video URLs (comma separated)"
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                              field.onChange(urls);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          URLs for product videos (YouTube, Vimeo, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer Images */}
                  <FormField
                    control={form.control}
                    name="customerImageUrls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Images</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter customer image URLs (comma separated)"
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                              field.onChange(urls);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          URLs for customer-submitted product images
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialOffers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Offers</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter special offers (comma separated)"
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const offers = e.target.value.split(',').map(offer => offer.trim()).filter(offer => offer);
                              field.onChange(offers);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Special offers to display on product page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Return Policy */}
                  <FormField
                    control={form.control}
                    name="returnPolicyText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Policy</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter return policy details"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed return policy for this product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  
                  {/* Note: Higher Purchase Information is ONLY in the Pricing tab to avoid duplicate React keys */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}