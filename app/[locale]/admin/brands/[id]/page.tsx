import { Metadata } from 'next'
import BrandForm from '../brand-form'
import { getBrandById } from '@/lib/actions/brand.actions'

export const metadata: Metadata = {
  title: 'Edit Brand',
}

type EditBrandProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditBrand(props: EditBrandProps) {
  // Properly await params before accessing id
  const params = await props.params
  const { id } = params
  const brand = await getBrandById(id)

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-bold'>Edit Brand</h1>
      <BrandForm initialValues={brand} />
    </div>
  )
}