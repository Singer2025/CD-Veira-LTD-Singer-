import { getAllCategories, getAllBrands, getAllProducts } from '@/lib/actions/product.actions';
import SearchClientComponent from './search-client-component';

interface SearchParams {
  q?: string;
  category?: string;
  tag?: string;
  price?: string;
  rating?: string;
  brand?: string;
  sort?: string;
  page?: string;
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams;
  const { q = 'all', category = 'all', tag = 'all', price = 'all',
          rating = 'all', brand = 'all', sort = 'best-selling', page = '1' } = params;

  const [categories, brands, initialData] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
    getAllProducts({
      query: q,
      category,
      tag,
      price,
      rating,
      brand,
      sort,
      page: Number(page)
    })
  ]);

  return (
    <SearchClientComponent
      searchParams={params}
      initialData={initialData}
      categories={categories}
      brands={brands}
    />
  );
}
