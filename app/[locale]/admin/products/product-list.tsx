'use client'

import { useEffect, useState, useTransition } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteProduct,
  getAllProductsForAdmin,
  getAllCategories,
  getAllBrands
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Grid, List, Filter, Star, Package, Tag, Truck } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

type ProductListDataProps = {
  products: IProduct[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps>()
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [mainCategoryFilter, setMainCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [categories, setCategories] = useState<any[]>([])
  const [mainCategories, setMainCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue,
        page: newPage,
        category: categoryFilter,
        stockStatus: stockFilter,
        brand: brandFilter,
        priceRange: priceFilter
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as any).debounce)
      ;(window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllProductsForAdmin({ 
            query: value, 
            page: 1,
            category: categoryFilter,
            stockStatus: stockFilter,
            brand: brandFilter,
            priceRange: priceFilter
          })
          setData(data)
          setPage(1)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllProductsForAdmin({ 
          query: '', 
          page: 1,
          category: categoryFilter,
          stockStatus: stockFilter,
          brand: brandFilter,
          priceRange: priceFilter
        })
        setData(data)
        setPage(1)
      })
    }
  }
  
  // Apply filters when they change
  useEffect(() => {
    if (page !== 1) setPage(1)
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ 
        query: inputValue,
        page: 1,
        mainCategory: mainCategoryFilter,
        category: categoryFilter,
        stockStatus: stockFilter,
        brand: brandFilter,
        priceRange: priceFilter
      })
      setData(data)
    })
  }, [mainCategoryFilter, categoryFilter, stockFilter, brandFilter, priceFilter])
  
  // Fetch categories and brands when component mounts
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const categoriesData = await getAllCategories()
        const brandsData = await getAllBrands()
        setCategories(categoriesData)
        setBrands(brandsData)
        
        // Filter main categories (parent categories with no parent or depth=0)
        const mainCats = categoriesData.filter(cat => 
          cat.isParent === true || cat.depth === 0 || !cat.parent
        )
        setMainCategories(mainCats)
      } catch (error) {
        console.error('Error fetching filter data:', error)
      }
    }
    
    fetchFiltersData()
    
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: '' })
      setData(data)
    })
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
            <Package className="h-6 w-6" /> Product Management
          </CardTitle>
          <CardDescription className="text-orange-700">
            Manage your product inventory, add new products, and track stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap justify-between items-center gap-4'>
            <div className='flex-1 min-w-[300px]'>
              <div className='relative'>
                <Input
                  className='pl-10 bg-white'
                  type='text'
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder='Search products by name, brand, or model...'
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex items-center border rounded-md p-1 bg-white'>
                <Button 
                  variant={viewMode === 'card' ? 'default' : 'ghost'} 
                  size='sm' 
                  onClick={() => setViewMode('card')}
                  className='rounded-r-none'
                >
                  <Grid className='h-4 w-4 mr-1' /> Grid
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'} 
                  size='sm' 
                  onClick={() => setViewMode('table')}
                  className='rounded-l-none'
                >
                  <List className='h-4 w-4 mr-1' /> List
                </Button>
              </div>
              <div className="flex gap-2">
                <Button asChild variant='default' className="bg-orange-600 hover:bg-orange-700">
                  <Link href='/admin/products/create'>Add New Product</Link>
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/admin/products/import' className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Bulk Import
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {!isPending && data?.totalProducts !== undefined && (
            <div className="mt-2 text-sm text-gray-600">
              {data?.totalProducts === 0
                ? 'No results found'
                : `Showing ${data?.from}-${data?.to} of ${data?.totalProducts} products`}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="w-full bg-orange-50 border border-orange-100">
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters & Categories</span>
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Product Attributes</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Inventory Status</span>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Ratings & Reviews</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="filters" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                <div>
                  <label className="text-sm font-medium mb-1 block">Main Category</label>
                  <Select 
                    value={mainCategoryFilter || 'all'} 
                    onValueChange={(value) => {
                      setMainCategoryFilter(value);
                      // Reset subcategory when main category changes
                      setCategoryFilter('all');
                      // Filter subcategories based on selected main category
                      if (value !== 'all') {
                        const filteredSubCategories = categories.filter(cat => {
                          const catParentId = typeof cat.parent === 'string' 
                            ? cat.parent 
                            : cat.parent?.toString();
                          return catParentId === value;
                        });
                        setSubCategories(filteredSubCategories);
                      } else {
                        setSubCategories([]);
                      }
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue>
                        {mainCategoryFilter === 'all'
                          ? 'All Main Categories'
                          : (() => {
                              const category = mainCategories.find(c => c._id === mainCategoryFilter)
                              if (category && typeof category === 'object' && 'name' in category) {
                                return category.name
                              }
                              return String(mainCategoryFilter)
                            })()
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Main Categories</SelectItem>
                      {mainCategories.map((category) => {
                        // Ensure category is an object with required properties
                        if (category && typeof category === 'object' && '_id' in category && 'name' in category) {
                          return (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          );
                        }
                        return null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Subcategory</label>
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                    disabled={!mainCategoryFilter || mainCategoryFilter === 'all'}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue>
                        {categoryFilter === 'all'
                          ? 'All Subcategories'
                          : (() => {
                              const category = categories.find(c => c._id === categoryFilter)
                              if (category && typeof category === 'object' && 'name' in category) {
                                return category.name
                              }
                              return String(categoryFilter)
                            })()
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Subcategories</SelectItem>
                      {subCategories.map((category) => {
                        // Ensure category is an object with required properties
                        if (category && typeof category === 'object' && '_id' in category && 'name' in category) {
                          return (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          );
                        }
                        return null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock Status</label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className='w-full'>
                      <SelectValue>
                        {stockFilter === 'all' ? 'All Stock' :
                         stockFilter === 'instock' ? 'In Stock' :
                         stockFilter === 'lowstock' ? 'Low Stock' : 'Out of Stock'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Stock</SelectItem>
                      <SelectItem value='instock'>In Stock</SelectItem>
                      <SelectItem value='lowstock'>Low Stock (≤5)</SelectItem>
                      <SelectItem value='outofstock'>Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Brand</label>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='All Brands' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id || brand} value={brand._id || brand}>
                          {brand.name || brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Price Range</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='All Prices' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Prices</SelectItem>
                      <SelectItem value='under500'>Under $500</SelectItem>
                      <SelectItem value='500to1000'>$500 - $1000</SelectItem>
                      <SelectItem value='1000to2000'>$1000 - $2000</SelectItem>
                      <SelectItem value='over2000'>Over $2000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attributes" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-4">
                <p>Product attribute filters will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-4">
                <p>Advanced inventory filters will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ratings" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-4">
                <p>Rating and review filters will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isPending ? (
        <div className="w-full py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-500">Loading products...</p>
        </div>
      ) : (
        data?.products && data.products.length > 0 ? (
          <div>
            {viewMode === 'table' ? (
              <>
                <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-md flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProducts.length > 0 && selectedProducts.length === data.products.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Select all products
                          setSelectedProducts(data.products.map(p => p._id));
                        } else {
                          // Deselect all products
                          setSelectedProducts([]);
                        }
                      }}
                      aria-label="Select all products"
                      className="h-5 w-5"
                    />
                    <span className="text-sm font-medium">
                      {selectedProducts.length > 0 
                        ? `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected` 
                        : 'Select all products'}
                    </span>
                  </div>
                  
                  {selectedProducts.length > 0 && (
                    <DeleteDialog
                      ids={selectedProducts}
                      action={deleteProduct}
                      buttonText={`Delete Selected (${selectedProducts.length})`}
                      buttonVariant="destructive"
                      buttonSize="sm"
                      title="Delete Selected Products"
                      description={`You are about to delete ${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}. This action cannot be undone.`}
                      callbackAction={() => {
                        // Only clear selected products after successful deletion
                        setSelectedProducts([]);
                        // Refresh the product list
                        startTransition(async () => {
                          const data = await getAllProductsForAdmin({
                            query: inputValue,
                            page: 1, // Reset to first page after deletion
                            mainCategory: mainCategoryFilter,
                            category: categoryFilter,
                            stockStatus: stockFilter,
                            brand: brandFilter,
                            priceRange: priceFilter
                          })
                          setData(data)
                          setPage(1) // Reset page number
                        })
                      }}
                    />
                  )}
                </div>
                <DataTable 
                  columns={columns} 
                  data={data.products}
                  searchKey="name"
                  searchPlaceholder="Filter products..."
                  pageCount={data.totalPages}
                  onPaginationChange={handlePageChange}
                  currentPage={page}
                  totalItems={data.totalProducts}
                  itemsPerPage={10}
                  onRowSelectionChange={(rows) => {
                    const selectedIds = Object.keys(rows).filter(key => rows[key]).map(key => key);
                    setSelectedProducts(selectedIds);
                  }}
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-md flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProducts.length > 0 && selectedProducts.length === data.products.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Select all products
                          setSelectedProducts(data.products.map(p => p._id));
                        } else {
                          // Deselect all products
                          setSelectedProducts([]);
                        }
                      }}
                      aria-label="Select all products"
                      className="h-5 w-5"
                    />
                    <span className="text-sm font-medium">
                      {selectedProducts.length > 0 
                        ? `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected` 
                        : 'Select all products'}
                    </span>
                  </div>
                  
                  {selectedProducts.length > 0 && (
                    <DeleteDialog
                      ids={selectedProducts}
                      action={deleteProduct}
                      buttonText={`Delete Selected (${selectedProducts.length})`}
                      buttonVariant="destructive"
                      buttonSize="sm"
                      title="Delete Selected Products"
                      description={`You are about to delete ${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}. This action cannot be undone.`}
                      callbackAction={() => {
                        // Only clear selected products after successful deletion
                        setSelectedProducts([]);
                        // Refresh the product list
                        startTransition(async () => {
                          const data = await getAllProductsForAdmin({
                            query: inputValue,
                            page: 1, // Reset to first page after deletion
                            mainCategory: mainCategoryFilter,
                            category: categoryFilter,
                            stockStatus: stockFilter,
                            brand: brandFilter,
                            priceRange: priceFilter
                          })
                          setData(data)
                          setPage(1) // Reset page number
                        })
                      }}
                    />
                  )}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {data.products.map((product: IProduct) => (
                    <Card key={product._id} className='overflow-hidden h-full flex flex-col border-gray-200 hover:border-orange-300 hover:shadow-md transition-all'>
                      <div className='relative h-52 bg-white border-b'>
                        {/* Selection Checkbox */}
                        <div className='absolute top-2 left-2 z-20'>
                          <Checkbox
                            checked={selectedProducts.includes(product._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts(prev => [...prev, product._id]);
                              } else {
                                setSelectedProducts(prev => prev.filter(id => id !== product._id));
                              }
                            }}
                            aria-label={`Select ${product.name}`}
                            className="h-5 w-5 bg-white border-gray-300"
                          />
                        </div>
                        {/* Model Number Badge */}
                        <div className='absolute top-2 right-2 z-10 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md'>
                          ID: {formatId(product._id)}
                        </div>
                        
                        {/* Stock Status Badges */}
                        <div className='absolute top-2 left-10 z-10 flex flex-col gap-1'>
                          {!product.isPublished && (
                            <Badge variant='secondary' className='bg-gray-200 text-gray-700'>
                              Draft
                            </Badge>
                          )}
                          {product.countInStock <= 0 && (
                            <Badge variant='destructive' className='bg-red-100 text-red-800 border border-red-200'>
                              <Truck className="h-3 w-3 mr-1" /> Out of Stock
                            </Badge>
                          )}
                          {product.countInStock > 0 && product.countInStock <= 5 && (
                            <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border border-yellow-200'>
                              <Truck className="h-3 w-3 mr-1" /> Low Stock: {product.countInStock}
                            </Badge>
                          )}
                          {product.countInStock > 5 && (
                            <Badge variant='outline' className='bg-green-100 text-green-800 border border-green-200'>
                              <Truck className="h-3 w-3 mr-1" /> In Stock
                            </Badge>
                          )}
                        </div>
                        
                        {/* Product Image */}
                        {product.images && product.images.length > 0 ? (
                          <Image 
                            src={product.images[0]} 
                            alt={product.name}
                            fill
                            className='object-contain p-3'
                          />
                        ) : (
                          <div className='flex items-center justify-center h-full text-gray-400'>
                            <Package className="h-16 w-16 opacity-20" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className='flex-grow pt-4'>
                        {/* Category & Brand */}
                        <div className='flex flex-wrap gap-1 mb-2'>
                          {/* Display category with hierarchy if available */}
                          <Badge variant='outline' className='bg-orange-50 text-orange-800 border-orange-200'>
                            <Tag className="h-3 w-3 mr-1" /> 
                            {product.category && typeof product.category === 'object' ? (
                              <>
                                {product.category.parent && typeof product.category.parent === 'object' && product.category.parent.name ? 
                                  <span className="opacity-70">{product.category.parent.name} / </span> : 
                                  product.mainCategory && typeof product.mainCategory === 'object' && product.mainCategory.name ? 
                                  <span className="opacity-70">{product.mainCategory.name} / </span> : 
                                  ''
                                }
                                {product.category.name}
                              </>
                            ) : (product.category || 'Uncategorized')}
                          </Badge>
                          {product.brand && (
                            <Badge variant='outline' className='bg-blue-50 text-blue-800 border-blue-200'>
                              {typeof product.brand === 'object' && product.brand?.name ? product.brand.name : product.brand}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Product Name */}
                        <h3 className='font-semibold text-lg line-clamp-2 mb-2 text-gray-800 min-h-[3.5rem]'>
                          <Link href={`/admin/products/${product._id}`} className='hover:text-orange-600'>
                            {product.name}
                          </Link>
                        </h3>
                        
                        {/* Pricing */}
                        <div className='flex items-end gap-2 mb-2'>
                          <p className='text-xl font-bold text-orange-600'>${product.price ? product.price.toFixed(2) : '0.00'}</p>
                          {product.listPrice && product.price && product.listPrice > product.price && (
                            <div className='flex flex-col'>
                              <p className='text-sm text-gray-500 line-through'>${product.listPrice.toFixed(2)}</p>
                              <p className='text-xs text-green-600'>
                                Save ${(product.listPrice - product.price).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Rating & Stock */}
                        <div className='flex justify-between items-center text-sm'>
                          <div className='flex items-center'>
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{product.avgRating > 0 ? product.avgRating.toFixed(1) : 'No ratings'}</span>
                          </div>
                          <div className='text-gray-500'>
                            {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                          </div>
                        </div>
                        
                        {/* Last Updated */}
                        <div className='mt-2 text-xs text-gray-500'>
                          Updated: {formatDateTime(product.updatedAt).dateTime}
                        </div>
                      </CardContent>
                      
                      <CardFooter className='border-t pt-4 flex justify-between bg-gray-50'>
                        <Button asChild variant='outline' size='sm' className='flex-1 mr-1 border-orange-200 hover:bg-orange-50 hover:text-orange-700'>
                          <Link href={`/admin/products/${product._id}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        </Button>
                        <Button asChild variant='outline' size='sm' className='flex-1 mx-1 border-blue-200 hover:bg-blue-50 hover:text-blue-700'>
                          <Link target='_blank' href={`/product/${product.slug}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                        </Button>
                        <DeleteDialog
                          id={product._id}
                          action={deleteProduct}
                          buttonVariant="outline"
                          buttonSize="sm"
                          buttonText="Delete"
                          title="Delete Product"
                          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                          callbackAction={() => {
                            // Refresh the product list after successful deletion
                            startTransition(async () => {
                              const data = await getAllProductsForAdmin({
                                query: inputValue,
                                page: 1, // Reset to first page after deletion
                                mainCategory: mainCategoryFilter,
                                category: categoryFilter,
                                stockStatus: stockFilter,
                                brand: brandFilter,
                                priceRange: priceFilter
                              })
                              setData(data)
                              setPage(1) // Reset page number
                            })
                          }}
                          className="flex-1 ml-1"
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination for card view */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {data.from}-{data.to} of {data.totalProducts} products
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= data.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <Package className="h-16 w-16 text-gray-300" />
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-gray-500 max-w-md">
                  {inputValue || categoryFilter !== 'all' || brandFilter !== 'all' || stockFilter !== 'all' || priceFilter !== 'all' ? 
                    'Try adjusting your search or filters to find what you\'re looking for.' : 
                    'Get started by adding your first product to the catalog.'}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button asChild variant='default'>
                    <Link href='/admin/products/create'>Add New Product</Link>
                  </Button>
                  <Button asChild variant='outline'>
                    <Link href='/admin/products/import' className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Bulk Import
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

export default ProductList
