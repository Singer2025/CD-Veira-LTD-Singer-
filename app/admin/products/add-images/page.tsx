'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { useRouter } from 'next/navigation'
import { getAllProductsForAdmin, updateProduct } from '@/lib/actions/product.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, ArrowLeft, Upload, Check, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { UploadDropzone } from '@/lib/uploadthing'
import { Badge } from '@/components/ui/badge'

export default function AddProductImagesPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch products that need images (have no images or empty images array)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const result = await getAllProductsForAdmin({
          page: 1,
          limit: 100, // Get more products to filter
        })
        
        // Filter products with no images or empty images array
        const productsNeedingImages = result.products.filter(
          (product: any) => !product.images || product.images.length === 0
        )
        
        setProducts(productsNeedingImages)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  // Handle image upload from UploadThing
  const handleImageUpload = (res: Array<{url: string}>) => {
    if (res && Array.isArray(res)) {
      const urls = res.map((file) => file.url)
      setUploadedImages([...uploadedImages, ...urls])
    }
  }

  // Handle image deletion
  const handleImageDelete = (url: string) => {
    const newImages = uploadedImages.filter(image => image !== url)
    setUploadedImages(newImages)
  }

  // Save images to product
  const saveImages = async () => {
    if (!selectedProduct || uploadedImages.length === 0) return
    
    setSaving(true)
    try {
      const result = await updateProduct({
        _id: selectedProduct._id,
        images: uploadedImages
      })
      
      if (result.success) {
        // Update the local products list
        setProducts(products.filter(p => p._id !== selectedProduct._id))
        setSelectedProduct(null)
        setUploadedImages([])
        setSuccessMessage(`Images added to ${selectedProduct.name} successfully!`)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        alert(`Failed to save images: ${result.message}`)
      }
    } catch (error) {
      console.error('Error saving images:', error)
      alert('Failed to save images. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Select a product to add images to
  const selectProduct = (product: any) => {
    setSelectedProduct(product)
    setUploadedImages([])
    setSuccessMessage('')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add Images to Products</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product selection panel */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Products Needing Images</CardTitle>
                <CardDescription>
                  {products.length === 0 
                    ? "All products have images!" 
                    : `${products.length} products need images`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>All products have images!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {products.map((product) => (
                      <div 
                        key={product._id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedProduct?._id === product._id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}`}
                        onClick={() => selectProduct(product)}
                      >
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate">SKU: {product.sku || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Image upload panel */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedProduct ? `Add Images to ${selectedProduct.name}` : 'Select a Product'}
                </CardTitle>
                <CardDescription>
                  {selectedProduct 
                    ? 'Upload images for this product' 
                    : 'Select a product from the list to add images'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProduct ? (
                  <div className="space-y-6">
                    {/* Product details */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium">{selectedProduct.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">SKU: {selectedProduct.sku || 'N/A'}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{selectedProduct.category?.name || 'No Category'}</Badge>
                        <Badge variant="outline">{selectedProduct.brand?.name || 'No Brand'}</Badge>
                      </div>
                    </div>

                    {/* Uploaded images preview */}
                    {uploadedImages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Uploaded Images</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                                  <Loader2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload dropzone */}
                    <div className="border rounded-md p-4">
                      <UploadDropzone
                        key={`upload-dropzone-${selectedProduct._id}`}
                        endpoint="imageUploader"
                        onClientUploadComplete={handleImageUpload}
                        onUploadError={(error: Error) => {
                          console.error('Upload error:', error)
                          alert(`Upload failed: ${error.message}`)
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a product from the list to add images</p>
                  </div>
                )}
              </CardContent>
              {selectedProduct && (
                <CardFooter>
                  <Button 
                    onClick={saveImages} 
                    disabled={uploadedImages.length === 0 || saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Images</>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}