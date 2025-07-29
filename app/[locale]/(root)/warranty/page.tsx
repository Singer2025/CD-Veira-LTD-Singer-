import Image from 'next/image'
import { Button } from '@/components/ui/button'

export async function generateMetadata() {
  return {
    title: 'Warranty Coverage - Singer',
    description: 'Learn about Singer warranty policies and coverage for your products',
  }
}

export default async function WarrantyPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner2.jpg"
              alt="Warranty Coverage"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                Warranty Coverage
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                Protecting your investment with comprehensive warranty coverage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Overview Section */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-red-800 mb-2">Our Warranty Promise</h2>
              <div className="w-20 h-1 bg-red-600 mb-6"></div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              At Singer, we stand behind the quality of our products. Our comprehensive warranty coverage ensures that your purchase is protected against manufacturing defects and premature failures. We believe in providing our customers with peace of mind and exceptional service throughout the lifetime of their products.
            </p>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="/images/banner1.jpg" 
              alt="Warranty Protection" 
              width={600} 
              height={400}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-white p-4">
              <p className="font-semibold">Quality You Can Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Details Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-red-800 mb-2">Warranty Coverage Details</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Standard Warranty</h3>
              <p className="text-gray-700 leading-relaxed">
                All Singer products come with a standard 1-year warranty that covers parts and labor for manufacturing defects. This warranty begins on the date of purchase and requires proof of purchase for warranty service.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Extended Warranty Options</h3>
              <p className="text-gray-700 leading-relaxed">
                For additional protection, we offer extended warranty plans that can be purchased at the time of your product purchase. These plans extend coverage for up to 3 additional years beyond the standard warranty period, providing longer-term peace of mind.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-3">What's Covered</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our warranty covers defects in materials and workmanship under normal use and maintenance. Covered items include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Mechanical and electrical components</li>
                <li>Motor and compressor failures</li>
                <li>Control panel and electronic issues</li>
                <li>Structural defects</li>
                <li>Manufacturing defects</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-3">What's Not Covered</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The following are generally not covered under our standard warranty:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Damage from misuse, abuse, or improper installation</li>
                <li>Normal wear and tear</li>
                <li>Cosmetic damage that doesn't affect functionality</li>
                <li>Damage from power surges or acts of nature</li>
                <li>Products with altered or removed serial numbers</li>
                <li>Products used for commercial purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Service Section */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-red-800 mb-2">How to Get Warranty Service</h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
        </div>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 leading-relaxed mb-8 text-center">
            If you experience an issue with your Singer product that you believe is covered under warranty, please follow these steps:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-600">
              <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Contact Us</h3>
              <p className="text-gray-700">
                Call our customer service line at 1-784-456-1857 or visit our store to report the issue.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-600">
              <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Verification</h3>
              <p className="text-gray-700">
                Provide your proof of purchase and product details for warranty verification.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-600">
              <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Service</h3>
              <p className="text-gray-700">
                Our technicians will assess the issue and provide repair or replacement as covered by your warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-800 text-white py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Warranty Assistance?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Our customer service team is ready to help with any warranty questions or claims you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <a href="/contact">Contact Us</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white hover:bg-white/10">
              <a href="tel:+17844561857">Call Now: 1-784-456-1857</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}