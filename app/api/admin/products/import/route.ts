import { NextRequest, NextResponse } from 'next/server'
import { processProductImportFile } from '@/lib/actions/product-import.actions'

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated and authorized (admin)
    // This would typically use your auth mechanism
    
    // Get the form data from the request
    const formData = await request.formData()
    
    // Process the import
    const result = await processProductImportFile(formData)
    
    // Return the result
    return NextResponse.json(result)
  } catch (error) {
    console.error('Product import error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0
      },
      { status: 500 }
    )
  }
}