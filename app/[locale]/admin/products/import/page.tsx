'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processProductImportFile } from '@/lib/actions/product-import.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, FileUp, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function ProductImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    totalProcessed: number
    successCount: number
    failedCount: number
    errors?: Array<{ row: number; error: string }>
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const importResult = await processProductImportFile(formData)
      setResult(importResult)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>
        <h1 className="text-3xl font-bold">Bulk Import Products</h1>
        <p className="text-gray-500 mt-2">
          Upload a CSV file to import multiple products at once
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Select a CSV file with your product data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {file ? file.name : 'Click to select a CSV file'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      CSV up to 10MB
                    </p>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload and Process'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Guidelines</CardTitle>
            <CardDescription>
              Follow these guidelines for a successful import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-600">Important</h3>
                <p className="text-sm text-red-600 font-medium mb-2">
                  Each row in your CSV must have exactly the same number of columns as the header row.
                  Use empty values (,,) for optional fields, but don't skip columns.
                </p>
                <h3 className="font-medium">Required Columns</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                  <li>name - Product name</li>
                  <li>price - Numeric price (e.g., 99.99)</li>
                  <li>countInStock - Whole number</li>
                  <li>category - Category ID or name</li>
                  <li>description - Product description</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Optional Columns</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                  <li>brand - Brand name or ID</li>
                  <li>image - Image URL</li>
                  <li>isFeatured - true/false</li>
                  <li>isPublished - true/false</li>
                  <li>slug - URL-friendly name (auto-generated if empty)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Sample Format</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-1">
                  name,price,countInStock,category,description,brand,image,isFeatured
                  <br />
                  Product 1,99.99,10,Electronics,Description here,Brand X,http://image.jpg,true
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/sample-product-import.csv">
                Download Sample CSV
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {result && (
        <div className="mt-8">
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              )}
              <div>
                <AlertTitle>
                  {result.success ? "Import Successful" : "Import Failed"}
                </AlertTitle>
                <AlertDescription>
                  <p>{result.message}</p>
                  <p className="mt-2">
                    Processed {result.totalProcessed} products: {result.successCount} successful,{" "}
                    {result.failedCount} failed
                  </p>
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Errors:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index}>
                            Row {error.row}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.success && (
                    <Button 
                      onClick={() => router.push('/admin/products')} 
                      className="mt-4"
                    >
                      View Products
                    </Button>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </div>
  )
}