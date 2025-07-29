'use server'

import { connectToDatabase } from '@/lib/db'
import Category, { ICategory } from '@/lib/db/models/category.model'
import { revalidatePath } from 'next/cache'
import mongoose from 'mongoose'
import { CategoryInputSchema, CategoryUpdateSchema } from '../validator'
import { z } from 'zod'
type GetAllCategoriesParams = {
  query?: string
  page?: number
  limit?: number
  fetchAll?: boolean
}

export async function getAllCategoriesForAdmin({
  query = '',
  page = 1,
  limit = 10,
  fetchAll = false,
}: GetAllCategoriesParams & { fetchAll?: boolean }) {
  try {
    await connectToDatabase()

    // Create a case-insensitive search query
    const searchQuery = query
      ? { name: { $regex: query, $options: 'i' } }
      : {}

    // Get total count of categories matching the search query
    const totalCategories = await Category.countDocuments(searchQuery)

    // Base query
    let categoriesQuery = Category.find(searchQuery)
      .sort({ updatedAt: -1 })
      .lean<ICategory[]>()

    // Define skipAmount outside the if block so it's accessible throughout the function
    let skipAmount = 0
    
    // Apply pagination only if not fetching all
    if (!fetchAll) {
      skipAmount = (page - 1) * limit
      categoriesQuery = categoriesQuery.skip(skipAmount).limit(limit)
    }

    // Execute query and transform results
    const categories = await categoriesQuery.then(docs => docs.map(doc => ({
      ...doc,
      _id: (doc._id as mongoose.Types.ObjectId).toString(),
      parent: doc.parent ? (doc.parent as mongoose.Types.ObjectId).toString() : undefined,
      path: doc.path ? doc.path.map((id: string | mongoose.Types.ObjectId) => id.toString()) : []
    })))

    const totalPages = fetchAll ? 1 : Math.ceil(totalCategories / limit)
    const from = fetchAll ? 1 : skipAmount + 1
    const to = fetchAll ? totalCategories : skipAmount + categories.length

    return {
      categories,
      totalPages,
      totalCategories,
      from,
      to,
    }
  } catch (error) {
    console.error('Error getting categories:', error)
    throw error
  }
}

export async function getCategoryById(id: string) {
  try {
    await connectToDatabase()

    const category = await Category.findById(id)
      .select('_id name slug parent depth path image bannerImage isFeatured description isParent attributeTemplates')
      .lean()
      .then(doc => {
        if (!doc) return null;
        
        return {
          _id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          parent: doc.parent?.toString(),
          depth: doc.depth,
          path: doc.path?.map(id => id.toString()) || [],
          image: doc.image,
          bannerImage: doc.bannerImage,
          isFeatured: doc.isFeatured,
          description: doc.description,
          isParent: doc.isParent,
          attributeTemplates: doc.attributeTemplates
        };
      })

    if (!category) {
      throw new Error('Category not found')
    }

    return category
  } catch (error) {
    console.error('Error getting category:', error)
    throw error
  }
}

// Use Zod schema for type inference
type CreateCategoryParams = z.infer<typeof CategoryInputSchema>

export async function createCategory(data: CreateCategoryParams) {
  // Validate input data using Zod schema
  const validatedData = CategoryInputSchema.parse(data)
  // Destructure validated data, excluding 'parent' as it's accessed via validatedData.parent
  const {
    name,
    slug,
    isParent,
    image,
    bannerImage,
    description,
    isFeatured,
    attributeTemplates
  } = validatedData
  try {
    await connectToDatabase()

    // Check if category with same slug already exists (DB check still needed for uniqueness)
    const existingCategory = await Category.findOne({ slug: validatedData.slug })
    if (existingCategory) {
      throw new Error(`Category with slug "${validatedData.slug}" already exists`)
    }

    // Use the destructured variables directly
    const categoryData: Partial<ICategory> = {
      name,
      slug,
      isParent,
      image: image || '/images/default-category.png', // Use destructured image
      bannerImage: bannerImage || undefined, // Use destructured bannerImage
      description,
      isFeatured: isFeatured || false, // Use destructured isFeatured
      attributeTemplates // Use destructured attributeTemplates
    }

    // Parent existence check (DB check still needed)
    if (validatedData.parent) {
      const parentCategory = await Category.findById(validatedData.parent)
      if (!parentCategory) {
        throw new Error(`Parent category with ID "${validatedData.parent}" not found`)
      }
      categoryData.parent = new mongoose.Types.ObjectId(validatedData.parent)
      // Depth calculation is handled by the model pre-save hook now
    } else {
      categoryData.parent = undefined // Ensure parent is undefined if not provided or if isParent is true
    }

    const newCategory = await Category.create(categoryData)

    // Removed incorrect logic attempting to update non-existent 'children' field

    revalidatePath('/admin/categories')

    // Serialize MongoDB document to plain JavaScript object
    return JSON.parse(JSON.stringify(newCategory))
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Use Zod schema for type inference, adding the ID
type UpdateCategoryParams = z.infer<typeof CategoryUpdateSchema>

export async function updateCategory(data: UpdateCategoryParams) {
  // Validate input data using Zod schema
  const validatedData = CategoryUpdateSchema.parse(data)
  const {
    // Destructure validated data, excluding 'parent' as it's accessed via validatedData.parent
    _id: id, // Rename _id to id for clarity
    name,
    slug,
    isParent,
    image,
    bannerImage,
    description,
    isFeatured,
    attributeTemplates
  } = validatedData
  try {
    await connectToDatabase()

    // Check if category exists (DB check still needed)
    const category = await Category.findById(id)
    if (!category) {
      throw new Error(`Category with ID "${id}" not found`)
    }

    // Check if another category with the same slug exists (DB check still needed)
    const existingCategoryWithSlug = await Category.findOne({
      slug: validatedData.slug,
      _id: { $ne: id },
    })
    if (existingCategoryWithSlug) {
      throw new Error(`Another category with slug "${validatedData.slug}" already exists`)
    }

    // Parent existence check (DB check still needed) and preparation
    let parentObjectId: mongoose.Types.ObjectId | undefined = undefined;
    if (validatedData.parent && !validatedData.isParent) {
        const parentCategory = await Category.findById(validatedData.parent);
        if (!parentCategory) {
            throw new Error(`Parent category with ID "${validatedData.parent}" not found`);
        }
        parentObjectId = parentCategory._id;
    }

    // Depth/Path updates are handled by the model pre-save hook

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { // Use the destructured variables directly
        name,
        slug,
        isParent,
        parent: parentObjectId, // Use the verified ObjectId or undefined
        image,
        bannerImage,
        description,
        isFeatured,
        attributeTemplates
      },
      { new: true }
    )

    // Children path updates are handled by the model pre-save hook

    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${id}`)

    // Serialize the result before returning
    return JSON.parse(JSON.stringify(updatedCategory))
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectToDatabase()

    // Check if category exists
    const category = await Category.findById(id)

    if (!category) {
      throw new Error('Category not found')
    }

    // Check if category has children
    const hasChildren = await Category.findOne({ parent: id })

    if (hasChildren) {
      throw new Error('Cannot delete category with children')
    }

    await Category.findByIdAndDelete(id)

    revalidatePath('/admin/categories')

    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export async function getAllCategories() {
  try {
    await connectToDatabase()
    const categories = await Category.find()
      .sort({ name: 1 })
      .select('name slug parent depth path image bannerImage isFeatured description isParent')
      .lean<ICategory[]>()
      .then(docs => docs.map(doc => ({
        name: doc.name,
        slug: doc.slug,
        parent: doc.parent ? (doc.parent as mongoose.Types.ObjectId).toString() : undefined,
        depth: doc.depth || 0,
        path: doc.path ? doc.path.map((id: string | mongoose.Types.ObjectId) => id.toString()) : [],
        image: doc.image || '/images/default-category.png',
        bannerImage: doc.bannerImage,
        isFeatured: doc.isFeatured || false,
        description: doc.description || '',
        isParent: doc.isParent || false,
        _id: (doc._id as mongoose.Types.ObjectId).toString()
      })))
    return categories
  } catch (error) {
    console.error('Error getting all categories:', error)
    throw error
  }
}

// Get featured categories for homepage
export async function getFeaturedCategories(limit: number = 4) {
  try {
    await connectToDatabase()

    const categories = await Category.find({ parent: { $exists: false } })
      .select('_id name slug image isFeatured')
      .sort({ isFeatured: -1, updatedAt: -1 })
      .limit(limit)
      .lean()
      .then(docs => docs.map(doc => ({
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        image: doc.image
      })))

    return categories
  } catch (error) {
    console.error('Error getting featured categories:', error)
    throw error
  }
}