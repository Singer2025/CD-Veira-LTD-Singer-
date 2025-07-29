'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processProductImportFile } from '@/lib/actions/product-import.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, FileUp, Loader2, Image as ImageIcon } from 'lucide-react'
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bulk Product Import</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/products">Back to Products</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Import multiple products at once using a CSV file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {file ? file.name : 'Click to select a CSV file'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Only CSV files are supported
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
                    Importing...
                  </>
                ) : (
                  'Import Products'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <h3 className="text-sm font-medium mb-2">CSV Format Requirements:</h3>
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li>First row must contain column headers</li>
              <li>Required columns: name, slug, category, brand, description, listPrice, countInStock, images</li>
              <li>For multiple images, separate URLs with semicolons (;)</li>
              <li>For specifications, use JSON format or key:value pairs separated by commas</li>
              <li>Category and brand can be specified by name, slug, or ID</li>
            </ul>
            <div className="mt-4 w-full">
              <Button variant="outline" className="w-full" asChild>
                <a href="/sample-product-import.csv" download>
                  Download Sample CSV
                </a>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              View the results of your product import operation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Alert variant={result.success ? "success" : "destructive"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {result.success ? 'Import Successful' : 'Import Failed'}
                  </AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                {result.totalProcessed > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Summary:</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-lg font-bold">{result.totalProcessed}</p>
                        <p className="text-xs text-gray-600">Total Processed</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-md">
                        <p className="text-lg font-bold text-green-700">{result.successCount}</p>
                        <p className="text-xs text-gray-600">Successful</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-md">
                        <p className="text-lg font-bold text-red-700">{result.failedCount}</p>
                        <p className="text-xs text-gray-600">Failed</p>
                      </div>
                    </div>
                    
                    {result.success && result.successCount > 0 && (
                      <div className="mt-4 text-center">
                        <p className="mb-2 text-sm">Need to add images to your imported products?</p>
                        <Button asChild>
                          <Link href="/dashboard/admin/products/add-images">
                            Add Images to Products
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Errors:</h3>
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {result.errors.map((error, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{error.row}</td>
                              <td className="px-3 py-2 text-sm text-red-600">{error.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Upload a CSV file to see import results</p>
              </div>
            )}
          </CardContent>
          {result?.success && (
            <CardFooter>
              <Button onClick={() => router.push('/admin/products')} className="w-full">
                Go to Products List
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}