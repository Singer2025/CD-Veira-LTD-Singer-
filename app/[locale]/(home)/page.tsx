import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import BrandsSlider from '@/components/shared/home/brands-slider'
import NewArrivalsSlider from '@/components/shared/home/new-arrivals-slider'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { ErrorBoundary } from '@/components/shared/error-boundary'

import {
  getProductsForCard,
  getProductsByTag,
  getNewestProducts
} from '@/lib/actions/product.actions'
import { getFeaturedCategories } from '@/lib/actions/category.actions'
import { getFeaturedBrands } from '@/lib/actions/brand.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { toSlug } from '@/lib/utils'
import { getTranslations, getLocale } from 'next-intl/server'

// Define an interface for the category structure
interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent?: string;
  image?: string;
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  const locale = await getLocale()
  const { carousels } = await getSetting()
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })
  const brands = await getFeaturedBrands()
  const categories = await getFeaturedCategories(4)
  const newestProducts = await getNewestProducts({ limit: 8 })
  const featureds = await getProductsForCard({
    tag: 'featured',
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
  })

  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: `/search`,
      },
      items: categories.map((category: { name: string; image: string; slug: string }) => ({
        name: category.name,
        image: category.image || '/images/default-category.jpg',
        href: `/search?category=${category.slug}`,
      })),
    },
    {
      title: t('Explore New Arrivals'),
      items: newestProducts.slice(0, 4).map(product => ({
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png',
        href: product.slug ? `/product/${product.slug}` : '#'
      })),
      link: {
        text: t('View All'),
        href: `/search?tag=new-arrival`,
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers.map(product => ({
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png',
        href: product.slug ? `/product/${product.slug}` : '#'
      })),
      link: {
        text: t('View All'),
        href: `/search?tag=best-seller`,
      },
    },
    {
      title: t('Featured Products'),
      items: featureds.map(product => ({
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png',
        href: product.slug ? `/product/${product.slug}` : '#'
      })),
      link: {
        text: t('Shop Now'),
        href: `/search?tag=featured`,
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-light)] to-[var(--color-white)]">
      {/* Hero Section with Brand Styling */}
      <section className="relative overflow-hidden">
        {carousels?.length > 0 ? (
          <ErrorBoundary
            fallback={
              <div className="aspect-[16/6] bg-red-50 border border-red-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <h3 className="text-xl font-bold text-red-800 mb-2">Carousel Error</h3>
                  <p className="text-red-700">Failed to load carousel. Please try again later.</p>
                </div>
              </div>
            }
          >
            <HomeCarousel items={carousels} />
          </ErrorBoundary>
        ) : (
          <div className="aspect-[16/6] bg-[var(--color-light)] flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-2">No Carousel Items</h3>
              <p className="text-[var(--color-dark)]/80">Please configure carousel in admin settings</p>
            </div>
          </div>
        )}
      </section>

      {/* Main Content with Consistent Spacing */}
      <main className="relative">
        {/* Category Cards Section */}
        <section className="py-[var(--space-xl)] px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-[var(--space-xl)]">
              <h2 className="text-[var(--text-heading-2)] font-bold text-[var(--color-dark)] mb-[var(--space-md)]">
                Discover Our Collections
              </h2>
              <p className="text-lg text-[var(--color-dark)]/80 max-w-2xl mx-auto">
                Explore our carefully curated selection of premium products across all categories
              </p>
            </div>
            <HomeCard cards={cards} />
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-[var(--space-xl)] bg-[var(--color-white)]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-light)] to-[var(--color-white)]">
              <CardContent className="p-8">
                <div className="text-center mb-[var(--space-lg)]">
                  <h2 className="text-[var(--text-heading-2)] font-bold text-[var(--color-primary-dark)] mb-[var(--space-sm)]">
                    {t("Explore New Arrivals")}
                  </h2>
                  <p className="text-[var(--color-dark)]/80">Fresh products just added to our collection</p>
                </div>
                <NewArrivalsSlider
                  title=""
                  products={newestProducts}
                  viewAllLink={`/search?tag=new-arrival`}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Brands Section */}
        <section className="py-[var(--space-xl)] bg-[var(--color-light)]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-[var(--color-white)]">
              <CardContent className="p-8">
                <div className="text-center mb-[var(--space-lg)]">
                  <h2 className="text-[var(--text-heading-2)] font-bold text-[var(--color-primary-dark)] mb-[var(--space-sm)]">
                    {t("Brands We Sell")}
                  </h2>
                  <p className="text-[var(--color-dark)]/80">Trusted brands, exceptional quality</p>
                </div>
                <BrandsSlider title="" brands={brands} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="py-[var(--space-xl)] bg-[var(--color-white)]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-light)] to-[var(--color-white)]">
              <CardContent className="p-8">
                <div className="text-center mb-[var(--space-lg)]">
                  <h2 className="text-[var(--text-heading-2)] font-bold text-[var(--color-primary-dark)] mb-[var(--space-sm)]">
                    {t('Best Selling Products')}
                  </h2>
                  <p className="text-[var(--color-dark)]/80">Customer favorites and top-rated items</p>
                </div>
                <ProductSlider
                  title=""
                  products={bestSellingProducts}
                  viewAllLink="./search?tag=best-seller"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Browsing History Section */}
        <section className="py-[var(--space-xl)] bg-[var(--color-light)]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-[var(--space-lg)]">
              <h2 className="text-[var(--text-heading-2)] font-bold text-[var(--color-primary-dark)] mb-[var(--space-sm)]">
                Continue Shopping
              </h2>
              <p className="text-[var(--color-dark)]/80">Pick up where you left off</p>
            </div>
            <BrowsingHistoryList />
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-[var(--space-xl)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-[var(--color-white)]">
          <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-8">
            <h2 className="text-[var(--text-heading-2)] md:text-[var(--text-heading-1)] font-bold mb-[var(--space-md)]">
              Ready to Find Your Perfect Product?
            </h2>
            <p className="text-[var(--text-body)] mb-[var(--space-lg)] text-[var(--color-light)]">
              Join thousands of satisfied customers who trust us for quality and service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-white)] text-[var(--color-primary-dark)] font-semibold rounded-lg hover:bg-[var(--color-light)] transition-colors duration-200 shadow-lg"
              >
                Shop All Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[var(--color-white)] text-[var(--color-white)] font-semibold rounded-lg hover:bg-[var(--color-white)] hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
