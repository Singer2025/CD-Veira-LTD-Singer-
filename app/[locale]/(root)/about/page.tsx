import Image from 'next/image'
import { Link } from '@/i18n/routing'
// Removed unused lucide-react icons and getTranslations
import { Button } from '@/components/ui/button'
import { getLocale } from 'next-intl/server'

export async function generateMetadata() {
  // t was unused
  return {
    title: 'About Us - Singer',
    description: 'Learn about Singer, our history, mission, and values',
  }
}

export default async function AboutPage() {
  // t was unused
  const locale = await getLocale()
  
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section (Kept as is) */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner1.jpg"
              alt="About Singer"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                About Singer
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                Delivering quality products and exceptional service since 1956
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "Where We Started" Section (Replaces "Our Story" text, keeps image layout) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-red-800 mb-2">Where We Started</h2>
              <div className="w-20 h-1 bg-red-600 mb-6"></div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              C. D. Veira Ltd / Singer started in 1956 by Cyril D. Veira, who at the time was selling and offering sewing machines on hire purchase. Cyril was then able to grow the company from sewing machines to offering the same services to refrigerators, freezers and gas cookers. Since then, we have been able to expand our product line to feature almost every household appliance and furniture fitting for every room with prices to fit every budget.
            </p>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="/images/banner2.jpg" 
              alt="Singer History" 
              width={600} 
              height={400}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-white p-4">
              <p className="font-semibold">A Legacy of Service</p> {/* Updated caption slightly */}
            </div>
          </div>
        </div>
      </section>

      {/* "What We Do" Section (Replaces "Mission & Values" content, keeps section shell) */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12"> {/* Kept text-center for heading */}
            <h2 className="text-3xl font-bold text-red-800 mb-2">What We Do</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>
          <div className="max-w-3xl mx-auto"> {/* Centering paragraph content */}
            <p className="text-gray-700 leading-relaxed">
              The family owned and operated company’s main branch stands on the corner of Halifax and Egmont Streets in Kingstown and operates its warehouses from Block 2000, Old Montrose. The small Family Owned and operated business allows customers to make cash purchases or make monthly payments on items. We offer free delivery island-wide and daily discounts making our prices most competitive. Most of our products are 220 volts which makes them perfect for Vincentian households. We stock parts only for the appliances that we carry which gives another reason to shop with us!
            </p>
          </div>
        </div>
      </section>

      {/* "Our Plans for the future" Section (Replaces "Achievements" content, keeps section shell) */}
      <section className="container mx-auto px-4 md:px-6 py-16"> {/* Added py-16 for consistency */}
        <div className="text-center mb-12"> {/* Kept text-center for heading */}
          <h2 className="text-3xl font-bold text-red-800 mb-2">Our Plans for the future</h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
        </div>
        <div className="max-w-3xl mx-auto"> {/* Centering paragraph content */}
          <p className="text-gray-700 leading-relaxed">
            Our plan is to continue to serve St. Vincent and the Grenadines with quality products at the most affordable prices. With an easy and hassle free hire purchase system, we intend to continue to give customers the option of low monthly installments with the first payment being their first month payment. Our intention is to continue to evolve the company to keep up with changing trends and times ensuring that the appliances that we carry are modern, energy saving and chic.
          </p>
        </div>
      </section>

      {/* CTA Section (Kept as is) */}
      <section className="bg-red-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Singer Family</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Discover why millions of customers around the world trust Singer for their home needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" className="bg-white text-red-700 hover:bg-gray-100 border-white">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white hover:bg-red-800">
              <Link href="/search">
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}