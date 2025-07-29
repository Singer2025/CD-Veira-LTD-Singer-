'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { IProduct } from '@/lib/db/models/product.model';
import { ICategory } from '@/lib/db/models/category.model';
import { IBrand } from '@/lib/db/models/brand.model';
import { getAllProducts } from '@/lib/actions/product.actions';
// Import formUrlQuery safely for client-side only usage
let formUrlQuery: any;
if (typeof window !== 'undefined') {
  formUrlQuery = (await import('@/lib/utils')).formUrlQuery;
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import ImageWithFallback from '@/components/shared/image-with-fallback';
import { CategoryTree } from '@/components/shared/category-tree';
import ProductCard from '@/components/shared/product/product-card';
import { PriceFilter } from '@/components/shared/price-filter';
import ProductSortSelector from '@/components/shared/product/product-sort-selector';
import Rating from '@/components/shared/product/rating';
import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Loader2, Folder, List, Star, Building2, Tag, Check } from 'lucide-react';

interface SearchClientProps {
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
  initialData: {
    products: IProduct[];
    totalPages: number;
    totalProducts: number;
    from: number;
    to: number;
  };
  categories: ICategory[];
  brands: IBrand[];
}

export default function SearchClientComponent({
  searchParams,
  initialData,
  categories,
  brands
}: SearchClientProps): JSX.Element {

  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  const [products, setProducts] = useState<IProduct[]>(initialData.products);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(initialData.totalPages);
  const [totalProducts] = useState(initialData.totalProducts);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(initialData.from);
  const [to, setTo] = useState(initialData.to);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '0px 0px 300px 0px',
  });

  // Create params object for filter URLs
  const params = { 
    q: searchParams.q || 'all',
    category: searchParams.category || 'all',
    tag: searchParams.tag || 'all',
    price: searchParams.price || 'all',
    rating: searchParams.rating || 'all',
    brand: searchParams.brand || 'all',
    sort: searchParams.sort || 'best-selling',
    page: searchParams.page || '1'
  };

  // Load more products when user scrolls to bottom
  useEffect(() => {
    const loadMoreProducts = async () => {
      if (loading || currentPage >= totalPages) return;
      
      try {
        setLoading(true);
        const nextPage = currentPage + 1;
        
        const data = await getAllProducts({
          category: params.category,
          tag: params.tag,
          brand: params.brand,
          query: params.q,
          price: params.price,
          rating: params.rating,
          page: nextPage,
          sort: params.sort,
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
    
    if (inView && currentPage < totalPages) {
      loadMoreProducts();
    }
  }, [inView, loading, currentPage, totalPages, params]);

  // Add new useEffect to reload products when search parameters change
  useEffect(() => {
    const reloadProducts = async () => {
      try {
        setLoading(true);
        
        const data = await getAllProducts({
          category: params.category,
          tag: params.tag,
          brand: params.brand,
          query: params.q,
          price: params.price,
          rating: params.rating,
          page: 1, // Reset to page 1
          sort: params.sort,
        });
        
        setProducts(data.products);
        setCurrentPage(1);
        setFrom(data.from);
        setTo(data.to);
      } catch (error) {
        console.error('Error reloading products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    reloadProducts();
  }, [searchParams]); // Depend on searchParams to reload when filters change

  // Helper function to safely use formUrlQuery
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
    if (!urlSearchParams) return;
    
    const newUrl = safeFormUrlQuery({
      params: urlSearchParams.toString(),
      key: 'page',
      value: newPage.toString(),
    });
    router.push(newUrl, { scroll: false });
  };

  const sortOrders = [
    { value: 'price-low-to-high', name: 'Price: Low to high' },
    { value: 'price-high-to-low', name: 'Price: High to low' },
    { value: 'newest-arrivals', name: 'Newest arrivals' },
    { value: 'avg-customer-review', name: 'Avg customer review' },
    { value: 'best-selling', name: 'Best selling' },
  ];

  return (
    <div>
      {/* Category Banner */}
      {(params.category === 'all' || params.category === '') && params.brand === 'all' ? (
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
      ) : params.category !== 'all' && params.category !== '' ? (
        <div className="category-banner mb-6 animate-fadeIn">
          <div className="relative overflow-hidden rounded-lg shadow-md">
            {(() => {
              const categoryObj = categories.find((c: ICategory) => 
                (typeof c === 'object' && c.slug === params.category) ||
                (typeof c === 'string' && c === params.category)
              );

              const categoryName = typeof categoryObj === 'object'
                ? categoryObj.name
                : params.category;

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
                  ) : params.category !== 'all' && params.category !== '' ? (
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
                  {params.brand !== 'all' ? (
                    <>
                      {brands.find((b: IBrand) => b.slug === params.brand)?.name || params.brand}
                      <span className="text-lg ml-2 font-normal">Products</span>
                    </>
                  ) : (
                    "All Departments"
                  )}
                </h1>
                <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl drop-shadow-md">
                  {params.brand !== 'all' ? `Browse products from ${brands.find((b: IBrand) => b.slug === params.brand)?.name || params.brand}` : "Browse products across all categories"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='mb-6 bg-white rounded-xl shadow-md p-3 sm:p-4 flex-between flex-col md:flex-row'>
        <div className='flex items-center flex-wrap'>
          <span className="font-medium text-gray-700 text-sm sm:text-base">
            {totalProducts === 0
              ? 'No'
              : `${from}-${to} of ${totalProducts}`}{' '}
            results
          </span>
          
          {/* Active Filters */}
          {((params.q !== 'all' && params.q !== '') ||
          (params.category !== 'all' && params.category !== '') ||
          (params.tag !== 'all' && params.tag !== '') ||
          params.rating !== 'all' ||
          params.price !== 'all' ||
          params.brand !== 'all') && (
            <div className="flex flex-wrap gap-1 sm:gap-2 ml-2 sm:ml-3 mt-2 md:mt-0">
              {params.q !== 'all' && params.q !== '' && (
                <Badge variant="outline" className="px-2 sm:px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                  <span className="truncate max-w-[80px] sm:max-w-none">Search: {params.q}</span>
                  <Link href={safeFormUrlQuery({
                    params: urlSearchParams.toString(),
                    key: 'q',
                    value: 'all'
                  })} className="hover:bg-primary/10 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Link>
                </Badge>
              )}
              
              {params.category !== 'all' && params.category !== '' && (
                <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary flex items-center gap-1.5">
                  <span>Category: {params.category}</span>
                  <Link href={safeFormUrlQuery({
                    params: urlSearchParams.toString(),
                    key: 'category',
                    value: 'all'
                  })} className="hover:bg-primary/10 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Link>
                </Badge>
              )}
              
              {params.tag !== 'all' && params.tag !== '' && (
                <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary flex items-center gap-1.5">
                  <span>Tag: {params.tag}</span>
                  <Link href={safeFormUrlQuery({
                    params: urlSearchParams.toString(),
                    key: 'tag',
                    value: 'all'
                  })} className="hover:bg-primary/10 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Link>
                </Badge>
              )}
              
              {params.price !== 'all' && (
                <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary flex items-center gap-1.5">
                  <span>Price: {params.price}</span>
                  <Link href={safeFormUrlQuery({
                    params: urlSearchParams.toString(),
                    key: 'price',
                    value: 'all'
                  })} className="hover:bg-primary/10 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Link>
                </Badge>
              )}
              
              {params.rating !== 'all' && (
                <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary flex items-center gap-1.5">
                  <span>Rating: {params.rating} & up</span>
                  <Link href={safeFormUrlQuery({
                    params: urlSearchParams.toString(),
                    key: 'rating',
                    value: 'all'
                  })} className="hover:bg-primary/10 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Link>
                </Badge>
              )}
              
              {params.brand !== 'all' && (
                <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary flex items-center gap-1.5">
                  <span>Brand: {params.brand}</span>
                  <Link href={safeFormUrlQuery({
                    params: urlSearchParams.toString(),
                    key: 'brand',
                    value: 'all'
                  })} className="hover:bg-primary/10 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Link>
                </Badge>
              )}
              
              {/* Clear All Button */}
              {((params.q !== 'all' && params.q !== '') ||
              (params.category !== 'all' && params.category !== '') ||
              (params.tag !== 'all' && params.tag !== '') ||
              params.rating !== 'all' ||
              params.price !== 'all' ||
              params.brand !== 'all') && (
                <Button variant="outline" asChild className="text-xs sm:text-sm px-2 sm:px-3 py-1 h-auto rounded-full">
                  <Link href={`/${locale}/search?q=all&category=all&tag=all&price=all&rating=all&brand=all`}>Clear all filters</Link>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={params.sort}
            params={params}
          />
        </div>
      </div>

      <div className='grid md:grid-cols-5 md:gap-10'>
        <div className="md:col-span-1">
          <CollapsibleOnMobile title="Filters">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 sticky top-24">
              <Accordion type="multiple" defaultValue={['department', 'brands']} className="w-full">
              <AccordionItem value="department">
                <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                  <div className='flex items-center gap-2'>
                    <Folder className='h-5 w-5 text-muted-foreground' />
                    Department
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4">
                  <ul className='space-y-2 pl-2'>
                    <li>
                      <Link
                        className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 text-sm w-full ${
                          ('all' === params.category || '' === params.category) 
                            ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                            : 'text-foreground hover:bg-gray-100'
                        }`}
                        href={safeFormUrlQuery({
                          params: urlSearchParams.toString(),
                          key: 'category',
                          value: 'all'
                        })}
                      >
                        <List className='h-4 w-4' />
                        <span className="font-medium">All Departments</span>
                      </Link>
                    </li>
                    <CategoryTree
                      categories={categories}
                      onCategorySelect={(category) => {
                        if (!urlSearchParams) return;
                        const newUrl = safeFormUrlQuery({
                          params: urlSearchParams.toString(),
                          key: 'category',
                          value: category
                        });
                        router.push(newUrl);
                      }}
                      filterState={params}
                    />
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <div className='py-4 border-t'>
                <h3 className='font-semibold text-base mb-4 flex items-center gap-2'>
                  <Tag className='h-5 w-5 text-muted-foreground' />
                  Price
                </h3>
                <div className="px-1">
                  <PriceFilter 
                    price={params.price} 
                    maxPrice={10000} 
                    onPriceRangeChange={(priceRange) => {
                      if (!urlSearchParams) return;
                      const newUrl = safeFormUrlQuery({
                        params: urlSearchParams.toString(),
                        key: 'price',
                        value: priceRange
                      });
                      router.push(newUrl);
                    }}
                  />
                </div>
              </div>

              <div className='py-4 border-t'>
                <h3 className='font-semibold text-base mb-4 flex items-center gap-2'>
                  <Star className='h-5 w-5 text-muted-foreground' />
                  Customer Review
                </h3>
                <ul className='space-y-2 pl-2'>
                  <li>
                    <Link
                      href={safeFormUrlQuery({
                        params: urlSearchParams.toString(),
                        key: 'rating',
                        value: 'all'
                      })}
                      className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 text-sm w-full ${
                        'all' === params.rating 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                          : 'text-foreground hover:bg-gray-100'
                      }`}
                    >
                      <List className='h-4 w-4' />
                      <span className="font-medium">All Reviews</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={safeFormUrlQuery({
                        params: urlSearchParams.toString(),
                        key: 'rating',
                        value: '4'
                      })}
                      className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 text-sm w-full ${
                        '4' === params.rating 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                          : 'text-foreground hover:bg-gray-100'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <Rating size={16} rating={4} />
                        <span className="font-medium">& Up</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={safeFormUrlQuery({
                        params: urlSearchParams.toString(),
                        key: 'rating',
                        value: '3'
                      })}
                      className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 text-sm w-full ${
                        '3' === params.rating 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                          : 'text-foreground hover:bg-gray-100'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <Rating size={16} rating={3} />
                        <span className="font-medium">& Up</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>

              <AccordionItem value="brands">
                <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                  <div className='flex items-center gap-2'>
                    <Building2 className='h-5 w-5 text-muted-foreground' />
                    Brands
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4">
                  <ul className='space-y-2 pl-2'>
                    <li>
                      <Link
                        className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 text-sm w-full ${
                          'all' === params.brand 
                            ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                            : 'text-foreground hover:bg-gray-100'
                        }`}
                        href={safeFormUrlQuery({
                          params: urlSearchParams.toString(),
                          key: 'brand',
                          value: 'all'
                        })}
                      >
                        <List className='h-4 w-4' />
                        <span className="font-medium">All Brands</span>
                      </Link>
                    </li>
                    {brands.map((b: IBrand) => (
                      <li key={b._id.toString()}>
                        <Link
                          className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 text-sm w-full ${
                            b.slug === params.brand 
                              ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                              : 'text-foreground hover:bg-gray-100'
                          }`}
                          href={safeFormUrlQuery({
                            params: urlSearchParams.toString(),
                            key: 'brand',
                            value: b.slug
                          })}
                        >
                          {b.logo ? (
                            <div className="relative h-5 w-5 flex-shrink-0 rounded-full overflow-hidden bg-gray-50 border border-gray-200">
                              <ImageWithFallback
                                src={b.logo}
                                alt={b.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                          ) : (
                            <Building2 className={`h-4 w-4 text-muted-foreground`} />
                          )}
                          <span className="font-medium truncate">{b.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </div>
          </CollapsibleOnMobile>
        </div>

        <div className="md:col-span-4">
          <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {products.map((product: IProduct) => (
              <motion.div
                key={product._id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 animate-pulse bg-primary/5 rounded-full blur-xl"></div>
              </div>
            </div>
          )}

          {!loading && currentPage < totalPages && (
            <div className="flex justify-center py-8 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  updatePageInUrl(nextPage);
                }}
              >
                Load More Products
              </Button>
            </div>
          )}

          {products.length > 0 && currentPage >= totalPages && (
            <div className="text-center py-8 text-muted-foreground animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5">
                <Check className="h-4 w-4 text-primary" />
                All products loaded
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md p-6 sm:p-8 mt-4">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <p className="text-lg sm:text-xl font-medium text-gray-800 mb-2">No products found</p>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <Button variant="default" asChild className="rounded-full px-6">
                <Link href={`/${locale}/search?q=all&category=all&tag=all&price=all&rating=all&brand=all`}>Clear all filters</Link>
              </Button>
            </div>
          )}

          <div ref={ref} />
        </div>
      </div>
    </div>
  );
}