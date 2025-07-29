import { Metadata } from 'next'
import CategoryList from './category-list'

export const metadata: Metadata = {
  title: 'Admin Categories',
}

export default async function AdminCategories() {
  return <CategoryList />
}