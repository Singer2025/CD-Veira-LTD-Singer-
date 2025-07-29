import { Metadata } from 'next'
import BrandForm from '../brand-form'

export const metadata: Metadata = {
  title: 'Create Brand',
}

export default function CreateBrand() {
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-bold'>Create Brand</h1>
      <BrandForm />
    </div>
  )
}