'use client'

import { useState, useEffect, Suspense } from 'react'
import { Link } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, FileUp, Image as ImageIcon } from 'lucide-react'
import ProductTable from '@/components/admin/ProductTable'
import Pagination from '@/components/Pagination'

// Component that uses useSearchParams wrapped in Suspense
function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  
  const page = Number(searchParams.get('page')) || 1
  const query = searchParams.get('query') || 'all'
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const result = await getAllProductsForAdmin({
          page,
          query: query !== 'all' ? query : '',
        })
        setProducts(result.products)
        setTotalPages(result.totalPages)
        setTotalProducts(result.totalProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [page, query])
  
  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('query', searchQuery)
    }
    params.set('page', '1')
    window.location.href = `/dashboard/admin/products?${params.toString()}`
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/admin/products/create">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/admin/products/import">
              <FileUp className="mr-2 h-4 w-4" /> Bulk Import
            </Link>
          </Button>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/admin/products/add-images">
              <ImageIcon className="mr-2 h-4 w-4" /> Add Images
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <>
          <ProductTable products={products} />
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/admin/products"
              queryParams={query !== 'all' ? { query } : {}}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {products.length} of {totalProducts} products
          </p>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-gray-500 mt-2">
            {query !== 'all'
              ? `No products match "${query}". Try a different search term.`
              : 'Get started by adding your first product.'}
          </p>
          {query !== 'all' && (
            <Button asChild variant="link" className="mt-4">
              <Link href="/dashboard/admin/products">Clear search</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Main page component that wraps ProductsContent with Suspense
export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>}>
      <ProductsContent />
    </Suspense>
  )
}