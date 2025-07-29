import { Metadata } from 'next'
import EnhancedCategoryForm from '../enhanced-category-form'
import { getCategoryById } from '@/lib/actions/category.actions'
// Removed unused import: import { ICategory } from '@/lib/db/models/category.model'

export const metadata: Metadata = {
  title: 'Edit Category',
}

export default async function EditCategory({
  params: { id } // Directly destructure the resolved id from params
}: {
  params: { id: string }
}) {
  // No need to await or log params anymore
  // const { id } = params; // Removed
  
  if (!id) {
    throw new Error('Category ID is required')
  }

  const category = await getCategoryById(id)

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-bold'>Edit Category</h1>
      <EnhancedCategoryForm initialValues={category || undefined} />
    </div>
  )
}