import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    brand: string
    sort: string
    page: string
  }>
}): Promise<Metadata> {
  const searchParams = await props.searchParams
  const t = await getTranslations()
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    brand = 'all',
  } = searchParams

  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    tag !== 'all' ||
    rating !== 'all' ||
    price !== 'all' ||
    brand !== 'all'
  ) {
    return {
      title: `${t('Search.Search')} ${q !== 'all' ? q : ''}
          ${category !== 'all' ? ` : ${t('Search.Category')} ${category}` : ''}
          ${tag !== 'all' ? ` : ${t('Search.Tag')} ${tag}` : ''}
          ${price !== 'all' ? ` : ${t('Search.PPrice')} ${price}` : ''}
          ${rating !== 'all' ? ` : ${t('Search.Rating')} ${rating}` : ''}
          ${brand !== 'all' ? ` : ${t('Search.Brand')} ${brand}` : ''}`,
    }
  } else {
    return {
      title: t('Search.Search Products'),
    }
  }
}