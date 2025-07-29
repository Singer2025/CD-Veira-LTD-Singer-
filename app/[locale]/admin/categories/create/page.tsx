import { Metadata } from 'next'
import EnhancedCategoryForm from '../enhanced-category-form'

export const metadata: Metadata = {
  title: 'Create Category',
}

export default function CreateCategory() {
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-bold'>Create Category</h1>
      <EnhancedCategoryForm />
    </div>
  )
}