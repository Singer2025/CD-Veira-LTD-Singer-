"use client";

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import ImageWithFallback from '@/components/shared/image-with-fallback';
import { CategoryTree } from '@/components/shared/category-tree';
import Pagination from '@/components/shared/pagination';
import ProductCard from '@/components/shared/product/product-card';
import { Button } from '@/components/ui/button';
import { Folder, List, Star, Building2, Tag, Loader2 } from 'lucide-react';
import { PriceFilter } from '@/components/shared/price-filter';
import ProductSortSelector from '@/components/shared/product/product-sort-selector';
import { getFilterUrl } from '@/lib/utils';
// Import formUrlQuery conditionally to avoid 'window is not defined' error
let formUrlQuery: any;
if (typeof window !== 'undefined') {
  const utils = require('@/lib/utils');
  formUrlQuery = utils.formUrlQuery;
}
import Rating from '@/components/shared/product/rating';
import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IProduct } from '@/lib/db/models/product.model';
import { ICategory } from '@/lib/db/models/category.model';
import { IBrand } from '@/lib/db/models/brand.model';
import { getAllProducts } from '@/lib/actions/product.actions';

const sortOrders = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg customer review' },
  { value: 'best-selling', name: 'Best selling' },
];

export default function SearchClient({
  initialProducts,
  initialCategories,
  initialBrands,
  initialPage,
  initialTotalPages,
  initialTotalProducts,
  initialFrom,
  initialTo,
  searchParams,
}: {
  initialProducts: IProduct[];
  initialCategories: ICategory[];
  initialBrands: IBrand[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalProducts: number;
  initialFrom: number;
  initialTo: number;
  searchParams: {
    q?: string;
    category?: string;
    tag?: string;
    price?: string;
    rating?: string;
    brand?: string;
    sort?: string;
    page?: string;
  };
}) {
  const t = useTranslations();
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  // Extract search parameters with defaults
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    brand = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams;

  // State for infinite scroll
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  // Setup intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '0px 0px 300px 0px', // Load more when user is 300px from bottom
  });

  // Load more products when user scrolls to bottom
  useEffect(() => {
    const loadMoreProducts = async () => {
      if (loading || currentPage >= totalPages) return;

      try {
        setLoading(true);
        const nextPage = currentPage + 1;
        const data = await getAllProducts({
          category,
          tag,
          brand,
          query: q,
          price,
          rating,
          page: nextPage,
          sort,
        });

        setProducts(prev => [...prev, ...data.products]);
        setCurrentPage(nextPage);
        setTo(data.to);
      } catch (error) {
        console.error('Error loading more products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (inView && !loading && currentPage < totalPages) {
      loadMoreProducts();
    }
  }, [inView, loading, currentPage, totalPages, q, category, tag, price, rating, brand, sort]);

  // Create params object for filter URLs
  const params = { q, category, tag, price, rating, brand, sort, page };

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

  // Handle URL updates when changing page
  const updatePageInUrl = (newPage: number) => {
    const newUrl = safeFormUrlQuery({
      params: urlSearchParams.toString(),
      key: 'page',
      value: newPage.toString(),
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div>
      {/* Category Banner */}
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
              const categoryObj = initialCategories.find((c) =>
                (typeof c === 'object' && c.slug === category) ||
                (typeof c === 'string' && c === category)
              );

              const categoryName = typeof categoryObj === 'object'
                ? categoryObj.name
                : category;

              const bannerImage = typeof categoryObj === 'object' &&
                (categoryObj.bannerImage || categoryObj.effectiveBannerImage)
                ? (categoryObj.bannerImage || categoryObj.effectiveBannerImage)
                : null;

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
                  ) : category !== 'all' && category !== '' ? (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40"></div>
                  ) : null}

                  <div className="absolute inset-0 flex items-center">
                    <div className="px-8 py-4 max-w-[80%]">
                      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                        {categoryName}
                      </h1>
                      {typeof categoryObj === 'object' && categoryObj.description && (
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
                      {initialBrands.find((b) => b.slug === brand)?.name || brand}
                      <span className="text-lg ml-2 font-normal">Products</span>
                    </>
                  ) : (
                    "All Departments"
                  )}
                </h1>
                <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl drop-shadow-md">
                  {brand !== 'all'
                    ? `Browse products from ${initialBrands.find((b) => b.slug === brand)?.name || brand}`
                    : "Browse products across all categories"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='my-2 bg-card md:border-b flex-between flex-col md:flex-row'>
        <div className='flex items-center'>
          {totalProducts === 0
            ? t('Search.No')
            : `${from}-${to} ${t('Search.of')} ${totalProducts}`}{' '}
          {t('Search.results')}
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          rating !== 'all' ||
          price !== 'all' ||
          brand !== 'all'
            ? ` ${t('Search.for')} `
            : null}
          {q !== 'all' && q !== '' && '"' + q + '"'}
          {category !== 'all' &&
            category !== '' &&
            `   ${t('Search.Category')}: ` + category}
          {tag !== 'all' && tag !== '' && `   ${t('Search.Tag')}: ` + tag}
          {price !== 'all' && `    ${t('Search.Price')}: ` + price}
          {rating !== 'all' &&
            `    ${t('Search.Rating')}: ` + rating + ` & ${t('Search.up')}`}
          {brand !== 'all' &&
            `    ${t('Search.Brand')}: ` + brand}
          &nbsp;
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          rating !== 'all' ||
          price !== 'all' ||
          brand !== 'all' ? (
            <Button variant={'link'} asChild>
              <Link href={`/${locale}/search`}>{t('Search.Clear')}</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>

      <div className='bg-card grid md:grid-cols-5 md:gap-6 p-4 rounded-lg shadow-sm'>
        <div className="md:col-span-1">
          <CollapsibleOnMobile title={t('Search.Filters')}>
            <Accordion type="multiple" defaultValue={['department', 'brands']} className="w-full">
              <AccordionItem value="department">
                <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                  <div className='flex items-center gap-2'>
                    <Folder className='h-5 w-5 text-muted-foreground' />
                    {t('Search.Department')}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4">
                  <ul className='space-y-1 pl-2'>
                    <li>
                      <Link
                        className={`flex items-center gap-2 p-1.5 rounded-md hover:bg-accent text-sm ${
                          ('all' === category || '' === category) ? 'text-primary font-medium' : 'text-foreground'
                        }`}
                        href={getFilterUrl({ category: 'all', params })}
                      >
                        <List className='h-4 w-4' />
                        {t('Search.All')}
                      </Link>
                    </li>
                    <CategoryTree
                      categories={initialCategories}
                      currentCategory={category}
                      params={params}
                    />
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <div className='py-4 border-t'>
                <h3 className='font-semibold text-base mb-3 flex items-center gap-2'>
                  <Tag className='h-5 w-5 text-muted-foreground' />
                  {t('Search.Price')}
                </h3>
                <div className="px-1">
                  <PriceFilter price={price} params={params} maxPrice={10000} />
                </div>
              </div>

              <div className='py-4 border-t'>
                <h3 className='font-semibold text-base mb-3 flex items-center gap-2'>
                  <Star className='h-5 w-5 text-muted-foreground' />
                  {t('Search.Customer Review')}
                </h3>
                <ul className='space-y-1 pl-2'>
                  <li>
                    <Link
                      href={getFilterUrl({ rating: 'all', params })}
                      className={`flex items-center gap-2 p-1.5 rounded-md hover:bg-accent text-sm ${
                        'all' === rating ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      <List className='h-4 w-4' />
                      {t('Search.All')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getFilterUrl({ rating: '4', params })}
                      className={`flex items-center gap-2 p-1.5 rounded-md hover:bg-accent text-sm ${
                        '4' === rating ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      <div className='flex items-center gap-1'>
                        <Rating size={16} rating={4} />
                        <span>{t('Search.& Up')}</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>

              <AccordionItem value="brands">
                <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                  <div className='flex items-center gap-2'>
                    <Building2 className='h-5 w-5 text-muted-foreground' />
                    {t('Search.Brands')}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4">
                  <ul className='space-y-1 pl-2 max-h-60 overflow-y-auto'>
                    <li>
                      <Link
                        className={`flex items-center gap-2 p-1.5 rounded-md hover:bg-accent text-sm ${
                          'all' === brand ? 'text-primary font-medium' : 'text-foreground'
                        }`}
                        href={getFilterUrl({ params: { ...params, brand: 'all' } })}
                      >
                        <List className='h-4 w-4' />
                        {t('Search.All')}
                      </Link>
                    </li>
                    {initialBrands.map((b) => (
                      <li key={b._id.toString()}>
                        <Link
                          className={`flex items-center gap-2 p-1.5 rounded-md hover:bg-accent text-sm ${
                            b.slug === brand ? 'text-primary font-medium' : 'text-foreground'
                          }`}
                          href={getFilterUrl({ params: { ...params, brand: b.slug } })}
                        >
                          <div className="flex items-center gap-2">
                            {b.logo ? (
                              <ImageWithFallback
                                src={`/images/${b.logo}`}
                                alt={b.name}
                                width={20}
                                height={20}
                                className='object-contain mr-1'
                              />
                            ) : category !== 'all' && category !== '' ? (
                              <Building2 className={`h-4 w-4 text-muted-foreground`} />
                            ) : null}
                            <span>{b.name}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CollapsibleOnMobile>
        </div>

        <div className='md:col-span-4 space-y-4'>
          <div>
            <div className='font-bold text-xl'>{t('Search.Results')}</div>
            <div>
              {t('Search.Check each product page for other buying options')}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {products.length === 0 && (
              <div className="p-8 text-center w-full col-span-full bg-muted/30 rounded-lg border border-dashed">
                <div className="text-muted-foreground">{t('Search.No product found')}</div>
              </div>
            )}
            {products.map((product) => (
              <div key={product._id} className="product-card transform transition-all duration-300 hover:scale-[1.02]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {totalPages > 1 && currentPage < totalPages && (
            <div ref={ref} className="h-10" />
          )}

          {totalPages > 1 && currentPage < totalPages && !loading && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={() => {
                  const nextPage = currentPage + 1;
                  updatePageInUrl(nextPage);
                }}
              >
                {t('Search.Load More')}
              </Button>
            </div>
          )}

          {totalPages > 0 && currentPage >= totalPages && products.length > 0 && (
            <div className="text-center text-muted-foreground py-4">
              {t('Search.No more products to load')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
