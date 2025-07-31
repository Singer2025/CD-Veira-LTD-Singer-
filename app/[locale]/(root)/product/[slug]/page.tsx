import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Suspense } from 'react'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'
import ReviewList from './review-list'
import ProductDetailsSkeleton from '@/components/shared/product/product-details-skeleton'
import ProductGallery from '@/components/shared/product/product-gallery'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import { Separator } from '@/components/ui/separator'
import RatingSummary from '@/components/shared/product/rating-summary'
import { getTranslations } from 'next-intl/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2 } from 'lucide-react'
import ProductSpecifications from '@/components/shared/product/product-specifications'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import DeliveryPickupOptions from '@/components/shared/product/delivery-pickup-options'
import ProductPrice from '@/components/shared/product/product-price' // Import ProductPrice
import { IProduct } from '@/lib/db/models/product.model'
import { Metadata } from 'next'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const t = await getTranslations()
  const params = await props.params
  const product = await getProductBySlug(params.slug)
  if (!product) {
    return { title: t('Product.Product not found') }
  }
  return {
    title: product.name,
    description: product.description,
  }
}

type PopulatedField = {
  _id: string;
  name: string;
  slug: string;
};

// Helper functions to safely access populated fields
const getBrandName = (brand: string | PopulatedField | null | undefined): string => {
  if (typeof brand === 'object' && brand && 'name' in brand) {
    return brand.name;
  }
  return String(brand || '') || 'Brand';
};

const getCategoryName = (category: string | PopulatedField | null | undefined): string => {
  if (typeof category === 'object' && category && 'name' in category) {
    return category.name;
  }
  return String(category || '') || 'Category';
};

const getCategorySlug = (category: string | PopulatedField | null | undefined): string => {
  if (typeof category === 'object' && category && 'slug' in category) {
    return category.slug;
  }
  return String(category || '') || '';
};

const getBrandSlug = (brand: string | PopulatedField | null | undefined): string => {
  if (typeof brand === 'object' && brand && 'slug' in brand) {
    return brand.slug;
  }
  return String(brand || '') || '';
};
 
// DeliveryPickupOptions component is now imported from @/components/shared/product/delivery-pickup-options

async function ProductDetailsContent({ slug }: { slug: string }) {
  const session = await getServerSession(authOptions)
  const product = await getProductBySlug(slug)
  console.log('[ProductDetails Page] Fetched Product Data:', JSON.stringify(product, null, 2)); // Add this line for debugging
  const t = await getTranslations()
  
  // Check if product exists first
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="h2-bold text-destructive">
          {t('Error.Product not found')}
        </h2>
        <p className="mt-4">
          {t('Error.Try again')} <Link href="/">{t('Error.Back To Home')}</Link>
        </p>
      </div>
    )
  }
  
  // Ensure we have a valid category reference
  const categoryId = typeof product.category === 'object' && product.category?._id
    ? product.category._id.toString()
    : typeof product.category === 'string'
      ? product.category
      : null;
 
  const relatedProducts = categoryId ? await getRelatedProductsByCategory({
    category: categoryId,
    productId: product._id.toString(),
    limit: 4,
  }) : [];
 
  const relatedProductsArray = Array.isArray(relatedProducts) ? relatedProducts : []
  // Get category ID for browsing history
  const categoryForHistory = (() => {
    if (!product.category) return '';
    if (typeof product.category === 'object' && '_id' in product.category) {
      return product.category._id.toString();
    }
    return String(product.category);
  })();
 
  const hasSpecifications = product.specifications && product.specifications.length > 0;
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AddToBrowsingHistory
        id={product._id.toString()}
        category={categoryForHistory}
      />
 
      {/* Redesigned Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-gray-600">
          <li>
            <Link href="/" className="block transition hover:text-gray-700">
              <span className="sr-only"> Home </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
          </li>
          <li className="rtl:rotate-180">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li>
            <Link href={`/search?brand=${getBrandSlug(product.brand)}`} className="block transition hover:text-gray-700">
              {getBrandName(product.brand)}
            </Link>
          </li>
          <li className="rtl:rotate-180">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li>
            <Link href={`/search?category=${getCategorySlug(product.category)}`} className="block transition hover:text-gray-700">
              {getCategoryName(product.category)}
            </Link>
          </li>
          <li className="rtl:rotate-180">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li>
            <span className="block transition text-gray-700">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>
 
      {/* Main Product Section */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6 lg:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 p-2 sm:p-3 lg:p-4">
          {/* Product Gallery - Left Column */}
          <div className="lg:col-span-1 order-1">
            <ProductGallery images={product.images} />
 
            {/* Product Description - Moved under gallery on desktop, hidden on mobile */}
            {product.description && (
              <div className="hidden lg:block pt-4 sm:pt-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('Product.Description')}</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <p className="text-sm sm:text-base">{product.description}</p>
                </div>
              </div>
            )}
          </div>
 
          {/* Product Info and Purchase Actions - Right Column */}
          <div className="lg:col-span-1 space-y-2 sm:space-y-3 lg:space-y-4 order-2">
            {/* Brand Above Product Name */}
            <div className="space-y-1">
              <Link href={`/search?brand=${getBrandSlug(product.brand)}`} className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 hover:text-primary transition block">
                {getBrandName(product.brand)}
              </Link>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            </div>
 
            {/* Add ProductPrice here */}
            <ProductPrice price={product.price || 0} listPrice={product.listPrice} className="text-xl sm:text-2xl lg:text-3xl" />
 
            {/* Model and SKU */}
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-500">
              {product.modelNumber && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{t('Product.Model')}:</span>
                  <span>{product.modelNumber}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">SKU:</span>
                  <span>{product.sku}</span>
                </div>
              )}
            </div>
 
            {/* Rating Summary */}
            <div className="py-1">
              <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                asPopover
                ratingDistribution={product.ratingDistribution}
              />
            </div>

            <Separator className="my-2 sm:my-3" />
 
 
            {/* Enhanced Delivery & Pickup Options */}
            <DeliveryPickupOptions product={product} />

            {/* Enquire Now Button */}
            <div className="pt-1 sm:pt-2">
              <Link href="/contact" className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-colors duration-200 text-sm">
                Enquire Now
              </Link>
            </div>
 
            {/* Key Features */}
            {hasSpecifications && (
              <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3 border-t border-gray-200 pt-2 sm:pt-3">
                <h3 className="text-sm sm:text-base font-semibold">{t('Product.Key Features')}</h3>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                  {product.specifications.slice(0, 3).map((spec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 sm:p-2.5 bg-gray-50 rounded-md">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-800 text-xs sm:text-sm leading-tight">{spec.title}</h4>
                        <p className="text-xs text-gray-600 mt-0.5 leading-tight">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {product.specifications.length > 3 && (
                  <div className="mt-2 text-center">
                    <button className="text-xs font-medium text-blue-600 hover:underline">
                      See All Features
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Product Description - Show only on mobile */}
         {product.description && (
           <div className="lg:hidden border-t border-gray-200 p-2 sm:p-3">
             <h2 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">{t('Product.Description')}</h2>
             <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
               <p className="text-xs sm:text-sm leading-relaxed">{product.description}</p>
             </div>
           </div>
         )}
       </section>
 
      {/* Product Details Tabs Section */}
      <section className="mb-4 sm:mb-6 lg:mb-8">
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="w-full justify-start mb-2 sm:mb-3 lg:mb-4 bg-gray-100 p-0.5 rounded-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto overflow-x-auto">
            <TabsTrigger value="specifications" className="text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 whitespace-nowrap">
              <span className="hidden sm:inline">{t('Product.Specifications')}</span>
              <span className="sm:hidden">Specs</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 whitespace-nowrap">
              <span className="hidden sm:inline">{t('Product.Details')}</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="warranty" className="text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 col-span-2 sm:col-span-1 whitespace-nowrap">
              <span className="hidden lg:inline">{t('Product.Warranty & Installation')}</span>
              <span className="lg:hidden">Warranty</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 whitespace-nowrap">
              <span className="hidden sm:inline">{t('Product.Reviews')} ({product.numReviews})</span>
              <span className="sm:hidden">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 col-span-2 sm:col-span-1 lg:col-span-1 whitespace-nowrap">
              Features
            </TabsTrigger>
          </TabsList>
 
          <TabsContent value="specifications" className="bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4">
            <ProductSpecifications
              product={product}
              hasSpecifications={hasSpecifications}
            />
          </TabsContent>

          <TabsContent value="details" className="bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4">
            <div className="prose max-w-none">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3">{t('Product.Detailed Information')}</h3>
              <div className="text-xs sm:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>
          </TabsContent>

          <TabsContent value="warranty" className="bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4">
            {product.warrantyDetails ? (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold">{t('Product.Warranty Information')}</h3>
                <div className="prose prose-sm max-w-none">
                  {/* Enhanced warranty formatting with proper paragraphing */}
                  <div className="space-y-2 sm:space-y-3">
                    {product.warrantyDetails.split('\n').map((paragraph, index) => 
                      paragraph.trim() ? (
                        <p key={index} className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                          {paragraph.trim()}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
                {product.installationRequired !== undefined && (
                  <div className="mt-3 p-2 sm:p-3 border rounded-md bg-gray-50">
                    <h4 className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">{t('Product.Installation')}</h4>
                    <p className="text-xs">
                      <span className="font-medium">{t('Product.Installation Required')}:</span>
                      {product.installationRequired ? t('Product.Yes') : t('Product.No')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-gray-500">
                <p className="text-xs sm:text-sm">{t('Product.No warranty information available')}</p>
              </div>
            )}
          </TabsContent>
 
          <TabsContent value="reviews" className="bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4">
            <ReviewList
              userId={session?.user?.id}
              product={product as IProduct}
            />
          </TabsContent>
          
          <TabsContent value="features" className="bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3">Key Features</h3>
              {product.specifications && product.specifications.length > 0 ? (
                <ul className="space-y-3">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-700 text-sm sm:text-base">
                        <span className="font-medium">{spec.title}:</span> {spec.value}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base">No features available for this product.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
 
      {/* Related Products Section */}
      {relatedProductsArray.length > 0 && (
        <section className="mb-12 bg-white py-8 px-4 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('Product.Related Products')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProductsArray.length > 0 ? (
              relatedProductsArray.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct._id.toString()} className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Link href={`/product/${relatedProduct.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0] : '/images/placeholder.jpg'}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                        loading='lazy'
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{relatedProduct.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getCategoryName(relatedProduct.category)}
                      </p>
                      <p className="text-xl font-bold text-gray-900 mt-2">
                        ${(relatedProduct.price ?? relatedProduct.listPrice ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">{t('Product.No related products found')}</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={`./search?category=${getCategorySlug(product.category)}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {t('Product.View More Related Products')}
            </Link>
          </div>
        </section>
      )}
 
      {/* Browsing History Section */}
      <section className="mb-12 bg-white py-8 px-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('Product.Your Browsing History')}</h2>
        <BrowsingHistoryList className="mt-0" />
      </section>
    </div>
  )
}

export default async function ProductDetails(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent slug={slug} />
    </Suspense>
  )
}
