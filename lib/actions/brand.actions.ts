'use server'

import { connectToDatabase } from '@/lib/db'
import Brand from '@/lib/db/models/brand.model' // Removed unused IBrand import
import { revalidatePath } from 'next/cache'
import { BrandInputSchema, BrandUpdateSchema } from '../validator'
import { z } from 'zod'
type GetAllBrandsParams = {
  query?: string
  page?: number
  limit?: number
}

export async function getAllBrandsForAdmin({
  query = '',
  page = 1,
  limit = 10,
}: GetAllBrandsParams) {
  try {
    await connectToDatabase()

    const skipAmount = (page - 1) * limit

    // Create a case-insensitive search query
    const searchQuery = query
      ? { name: { $regex: query, $options: 'i' } }
      : {}

    // Get total count of brands matching the search query
    const totalBrands = await Brand.countDocuments(searchQuery)

    // Get brands with pagination
    const brands = await Brand.find(searchQuery)
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit)
      .lean() // Convert MongoDB documents to plain JavaScript objects

    const totalPages = Math.ceil(totalBrands / limit)

    // Serialize the entire response object
    return JSON.parse(JSON.stringify({
      brands,
      totalPages,
      totalBrands,
      from: skipAmount + 1,
      to: skipAmount + brands.length,
    }))
  } catch (error) {
    console.error('Error getting brands:', error)
    throw error
  }
}

export async function getBrandById(id: string) {
  try {
    await connectToDatabase()

    const brand = await Brand.findById(id).lean()

    if (!brand) {
      throw new Error('Brand not found')
    }

    // Serialize MongoDB document to plain JavaScript object
    return JSON.parse(JSON.stringify(brand))
  } catch (error) {
    console.error('Error getting brand:', error)
    throw error
  }
}

// Use Zod schema for type inference
type CreateBrandParams = z.infer<typeof BrandInputSchema>

export async function createBrand(data: CreateBrandParams) {
  try {
    // Validate input data using Zod schema
    const validatedData = BrandInputSchema.parse(data)
    
    await connectToDatabase()

    // Check if brand with the same slug already exists
    const existingBrand = await Brand.findOne({ slug: validatedData.slug })
    if (existingBrand) {
      return { 
        success: false, 
        message: `Brand with slug "${validatedData.slug}" already exists`
      }
    }

    // Use validated data for creation
    const newBrand = await Brand.create({
      ...validatedData,
      isFeatured: validatedData.isFeatured || false, // Ensure default is applied if undefined
    })

    revalidatePath('/admin/brands')

    // Serialize MongoDB document to plain JavaScript object
    return JSON.parse(JSON.stringify(newBrand))
  } catch (error) {
    console.error('Error creating brand:', error)
    throw error
  }
}

// Use Zod schema for type inference, adding the ID
type UpdateBrandParams = z.infer<typeof BrandUpdateSchema>

export async function updateBrand(data: UpdateBrandParams) {
  // Validate input data using Zod schema
  const validatedData = BrandUpdateSchema.parse(data)
  const { _id: id, ...updateData } = validatedData // Extract id and rest of data
  try {
    await connectToDatabase()

    // Check if brand exists (DB check still needed)
    const brand = await Brand.findById(id)
    if (!brand) {
      return { success: false, message: `Brand with ID "${id}" not found` }
    }

    // Check if another brand with the same slug exists (DB check still needed)
    const existingBrandWithSlug = await Brand.findOne({
      slug: updateData.slug,
      _id: { $ne: id },
    })
    if (existingBrandWithSlug) {
      return { success: false, message: `Another brand with slug "${updateData.slug}" already exists` }
    }

    console.log('Updating brand with ID:', id, 'and data:', updateData)
    
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      updateData, // Pass the validated update data directly
      { new: true, runValidators: true }
    )

    if (!updatedBrand) {
      return { success: false, message: `Failed to update brand with ID "${id}"` }
    }

    console.log('Updated brand:', updatedBrand)

    revalidatePath('/admin/brands')
    revalidatePath(`/admin/brands/${id}`)

    // Return success response with the updated brand
    return { 
      success: true, 
      message: 'Brand updated successfully',
      data: JSON.parse(JSON.stringify(updatedBrand))
    }
  } catch (error) {
    console.error('Error updating brand:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update brand'
    }
  }
}

export async function deleteBrand(id: string) {
  try {
    await connectToDatabase()

    // Check if brand exists
    const brand = await Brand.findById(id)

    if (!brand) {
      throw new Error('Brand not found')
    }

    await Brand.findByIdAndDelete(id)

    revalidatePath('/admin/brands')

    return { success: true }
  } catch (error) {
    console.error('Error deleting brand:', error)
    throw error
  }
}

export async function getAllBrands() {
  try {
    await connectToDatabase()

    const brands = await Brand.find().sort({ name: 1 }).lean()

    // Serialize MongoDB documents to plain JavaScript objects
    return JSON.parse(JSON.stringify(brands))
  } catch (error) {
    console.error('Error getting all brands:', error)
    throw error
  }
}

// Get only featured brands for storefront display
export async function getFeaturedBrands() {
  try {
    await connectToDatabase()

    // Find brands marked as featured
    const brands = await Brand.find({ isFeatured: true }).sort({ name: 1 }).lean()

    // Serialize MongoDB documents to plain JavaScript objects
    return JSON.parse(JSON.stringify(brands))
  } catch (error) {
    console.error('Error getting featured brands:', error)
    throw error
  }
}