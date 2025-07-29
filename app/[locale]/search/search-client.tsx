'use client'

import { Link } from '@/i18n/routing'
import ImageWithFallback from '@/components/shared/image-with-fallback'
import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import {
  Tag,
  Loader2,
} from 'lucide-react'
import { getAllProducts } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { ICategory } from '@/lib/db/models/category.model'
import { IBrand } from '@/lib/db/models/brand.model'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
// Import formUrlQuery conditionally to avoid 'window is not defined' error
let formUrlQuery: any;
if (typeof window !== 'undefined') {
  const utils = require('@/lib/utils');
  formUrlQuery = utils.formUrlQuery;
}
import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile'
import {
  Accordion,
} from "@/components/ui/accordion"
import { useTranslations, useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import ProductCardSkeleton from '@/components/shared/product/product-card-skeleton'
import PriceFilterSkeleton from '@/components/shared/PriceFilterSkeleton'
import CustomerReviewFilterSkeleton from '@/components/search/CustomerReviewFilterSkeleton'
import BrandFilterSkeleton from '@/components/search/BrandFilterSkeleton'
import DepartmentFilterSkeleton from '@/components/search/DepartmentFilterSkeleton'
import dynamic from 'next/dynamic'

const DepartmentFilter = dynamic(
  () => import('@/components/search/DepartmentFilter'),
  {
    loading: () => <DepartmentFilterSkeleton />,
    ssr: false,
  }
)

const BrandFilter = dynamic(
  () => import('@/components/search/BrandFilter'),
  {
    loading: () => <BrandFilterSkeleton />,
    ssr: false,
  }
)

const CustomerReviewFilter = dynamic(
  () => import('@/components/search/CustomerReviewFilter'),
  {
    loading: () => <CustomerReviewFilterSkeleton />,
    ssr: false,
  }
)

const PriceFilter = dynamic(
  () => import('@/components/shared/price-filter').then((mod) => mod.PriceFilter),
  {
    loading: () => <PriceFilterSkeleton />,
    ssr: false,
  }
)
 
const sortOrders = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg customer review' },
  { value: 'best-selling', name: 'Best selling' },
]

interface SearchClientProps {
  searchParams: {
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    brand?: string
    sort?: string
    page?: string
  }
  initialProducts: IProduct[]
  initialCategories: ICategory[]
  initialBrands: IBrand[]
  initialTotalPages: number
  initialTotalProducts: number
  initialFrom: number
  initialTo: number
}

export default function SearchClient({
  searchParams,
  initialProducts,
  initialCategories,
  initialBrands,
  initialTotalPages,
  initialTotalProducts,
  initialFrom,
  initialTo,
}: SearchClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const urlSearchParams = useSearchParams()

  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    brand = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams

  const [products, setProducts] = useState<IProduct[]>(initialProducts)
  const [categories] = useState<ICategory[]>(initialCategories)
  const [brands] = useState<IBrand[]>(initialBrands)
  const [currentPage, setCurrentPage] = useState(Number(page))
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts)
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [loading, setLoading] = useState(false)

  const [initialLoading, setInitialLoading] = useState(true)
 
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '0px 0px 300px 0px',
  })

  // Effect to reset products when filters change
  useEffect(() => {
    setProducts(initialProducts);
    setTotalPages(initialTotalPages);
    setTotalProducts(initialTotalProducts);
    setFrom(initialFrom);
    setTo(initialTo);
    setCurrentPage(1); // Reset to page 1 on any filter change
    setInitialLoading(false)
  }, [q, category, tag, price, rating, brand, sort, initialProducts, initialTotalPages, initialTotalProducts, initialFrom, initialTo]);
 
 
  // Effect for infinite scroll
  useEffect(() => {
    const loadMoreProducts = async () => {
      if (loading || currentPage >= totalPages) return

      setLoading(true)
      const nextPage = currentPage + 1

      const data = await getAllProducts({
        category,
        tag,
        brand,
        query: q,
        price,
        rating,
        page: nextPage,
        sort,
      })

      setProducts((prev) => [...prev, ...data.products])
      setCurrentPage(nextPage)
      setTo(data.to)
      setLoading(false)
    }

    if (inView && currentPage < totalPages) {
      loadMoreProducts()
    }
  }, [inView, loading, currentPage, totalPages, q, category, tag, price, rating, brand, sort])

  const params = { q, category, tag, price, rating, brand, sort, page }

  // Safe wrapper for formUrlQuery with fallback
  const locale = useLocale();
  const safeFormUrlQuery = ({
    params,
    key,
    value,
  }: {
    params: string;
    key: string;
    value: string | null;
  }) => {
    if (typeof formUrlQuery === 'function') {
      return formUrlQuery({ params, key, value, path: `/${locale}/search` });
    } else {
      // Fallback if formUrlQuery is not available
      const urlParams = new URLSearchParams(params);
      if (value === null) {
        urlParams.delete(key);
      } else {
        urlParams.set(key, value);
      }
      return `/${locale}/search?${urlParams.toString()}`;
    }
  };

  const updatePageInUrl = (newPage: number) => {
    const newUrl = safeFormUrlQuery({
      params: urlSearchParams?.toString() || '',
      key: 'page',
      value: newPage.toString(),
    })
    router.push(newUrl, { scroll: false })
  }

  const handlePriceRangeChange = (priceRange: string) => {
    const newUrl = safeFormUrlQuery({
      params: urlSearchParams?.toString() || '',
      key: 'price',
      value: priceRange,
    });
    router.push(newUrl, { scroll: false });
  };
  return (
    <div>
      {/* Banner Logic */}
      {(category === 'all' || category === '') && brand === 'all' ? (
        <div className="category-banner mb-6 animate-fadeIn">
          <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
            <div className="absolute inset-0">
              <ImageWithFallback
                src="/images/All Departments.jpg"
                alt="All Departments"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 py-4 max-w-[80%]">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                  All Departments
                </h1>
                <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl drop-shadow-md">
                  Browse products across all categories
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : category !== 'all' && category !== '' ? (
        <div className="category-banner mb-6 animate-fadeIn">
          <div className="relative overflow-hidden rounded-lg shadow-md">
            {(() => {
              const categoryObj = categories.find((c: ICategory) => c.slug === category);
              const categoryName = categoryObj ? categoryObj.name : category;
              const bannerImage = categoryObj ? (categoryObj.bannerImage || categoryObj.effectiveBannerImage) : null;

              return (
                <div className="aspect-[5/1] w-full">
                  {bannerImage ? (
                    <div className="absolute inset-0">
                      <ImageWithFallback
                        src={bannerImage}
                        alt={categoryName}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40"></div>
                  )}
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-8 py-4 max-w-[80%]">
                      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                        {categoryName}
                      </h1>
                      {categoryObj?.description && (
                        <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl drop-shadow-md">
                          {categoryObj.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="category-banner mb-6 animate-fadeIn">
          <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
            <div className="absolute inset-0">
              <ImageWithFallback
                src="/images/All Departments.jpg"
                alt="All Departments"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 py-4 max-w-[80%]">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                  {brand !== 'all' ? (
                    <>
                      {brands.find((b: IBrand) => b.slug === brand)?.name || brand}
                      <span className="text-lg ml-2 font-normal">Products</span>
                    </>
                  ) : (
                    "All Departments"
                  )}
                </h1>
                <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl drop-shadow-md">
                  {brand !== 'all' ? `Browse products from ${brands.find((b: IBrand) => b.slug === brand)?.name || brand}` : "Browse products across all categories"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Results Info and Sorter */}
      <div className="my-4 p-2 bg-white rounded-full shadow-lg flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 pl-4">
          <p className="font-medium text-gray-700">
            {totalProducts > 0 ? `${from}-${to} of ${totalProducts}` : 'No'} results
          </p>
          {q !== 'all' && q !== '' && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
              <span className="text-gray-500">Query:</span>
              <span className="font-semibold text-gray-800">{q}</span>
            </div>
          )}
          {category !== 'all' && category !== '' && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
              <span className="text-gray-500">Category:</span>
              <span className="font-semibold text-gray-800">{categories.find(c => c.slug === category)?.name || category}</span>
            </div>
          )}
          {(q !== 'all' && q !== '') || (category !== 'all' && category !== '') ? (
            <Button variant="ghost" size="sm" asChild className="rounded-full h-7 text-xs">
              <Link href={`/${locale}/search?q=all&category=all&tag=all&price=all&rating=all&brand=all`}>Clear</Link>
            </Button>
          ) : null}
        </div>
        <div className="pr-2">
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='bg-card grid md:grid-cols-5 md:gap-6 p-4 rounded-lg shadow-sm'>
        <div className="md:col-span-1">
          <CollapsibleOnMobile title={t('Search.Filters')}>
            <Accordion type="multiple" defaultValue={['department', 'brands']} className="w-full">
              <DepartmentFilter
                categories={categories}
                filterState={params}
                setFilterState={() => {}}
              />

              <div className='py-4 border-t'>
                <h3 className='font-semibold text-base mb-3 flex items-center gap-2'>
                  <Tag className='h-5 w-5 text-muted-foreground' />
                  {t('Search.Price')}
                </h3>
                <div className="px-1">
                  <PriceFilter
                    price={price}
                    maxPrice={10000}
                    onPriceRangeChange={handlePriceRangeChange}
                  />
                </div>
              </div>

              <div className='py-4 border-t'>
                <CustomerReviewFilter
                  filterState={params}
                  setFilterState={() => {}}
                />
              </div>

              <BrandFilter
                brands={brands}
                filterState={params}
                setFilterState={() => {}}
              />
            </Accordion>
          </CollapsibleOnMobile>
        </div>

        <div className="md:col-span-4">
          {initialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-medium text-muted-foreground">
                {t('Search.No product found')}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t('Search.Check each product page for other buying options')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product: IProduct) => (
                <ProductCard
                  key={product._id.toString()}
                  product={product}
                />
              ))}
            </div>
          )}
 
          <div ref={ref} className="flex justify-center py-4">
            {loading && !initialLoading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{t('Search.LoadingMore')}</span>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={updatePageInUrl}
            />
          )}
        </div>
      </div>
    </div>
  )
}