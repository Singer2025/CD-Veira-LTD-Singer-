import { getAllCategories, getAllBrands, getAllProducts } from '@/lib/actions/product.actions';
import SearchClient from './search-client';

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

export default async function SearchServer({
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
    <SearchClient
      searchParams={searchParams}
      initialProducts={initialData.products}
      initialCategories={categories}
      initialBrands={brands}
      initialTotalPages={initialData.totalPages}
      initialTotalProducts={initialData.totalProducts}
      initialFrom={initialData.from}
      initialTo={initialData.to}
    />
  );
}