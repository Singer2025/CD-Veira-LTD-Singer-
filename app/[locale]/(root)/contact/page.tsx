import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Phone, Mail, Clock, MessageSquare, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContactFormWrapper from '@/components/contact/ContactFormWrapper'

export async function generateMetadata() {
  // const t = await getTranslations() // Removed unused variable
  return {
    title: 'Contact Us - Singer',
    description: 'Get in touch with Singer customer service, sales, and support teams',
  }
}

export default async function ContactPage() {
  // const t = await getTranslations() // Removed unused variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapQuery = "5Q3G%2BJ8V%2C%20Halifax%20St%2C%20Kingstown";
  let mapSrc = `https://www.google.com/maps/embed/v1/place?q=${mapQuery}`;
  if (apiKey) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${mapQuery}`;
  }
  
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner3.jpg"
              alt="Contact Singer"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                Contact Us
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                We&amp;apos;re here to help with any questions or concerns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Call Us</h3>
            <p className="text-gray-600 mb-4">Our customer service team is available to assist you with any inquiries.</p>
            <div className="space-y-2">
              <p className="flex items-center text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-red-600" />
                <span>Toll Free: 1-784-456-1857</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-red-600" />
                <span>Toll Free: 1-784-456-1857</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Email Us</h3>
            <p className="text-gray-600 mb-4">Send us an email and we&amp;apos;ll get back to you within 24 hours.</p>
            <div className="space-y-2">
              <p className="flex items-center text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-red-600" />
                <span>Email: cdveiraltd@gmail.com</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-red-600" />
                <span>Email: cdveiraltd@gmail.com</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Business Hours</h3>
            <p className="text-gray-600 mb-4">Our team is available during the following hours:</p>
            <div className="space-y-2">
              <p className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-red-600" />
                <span>Mon - Fri 8 AM to 4 PM</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-red-600" />
                <span>Sat 8 AM to 12 Noon</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-red-600" />
                <span>Sunday - Closed</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <ContactFormWrapper />
          
          {/* Store Locations */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-6">Our Locations</h2>
              <p className="text-gray-600 mb-6">Visit one of our store locations to see our products in person and speak with our knowledgeable staff.</p>
            </div>
            
            <div className="mt-6">
              <iframe
                src={mapSrc}
                width="100%"
                height="450"
                style={{ border:0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-red-800 mb-2">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Find quick answers to common questions about our products and services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                What is your return policy?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day return policy on most items. Products must be returned in their original packaging with all accessories included.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                How can I track my order?
              </h3>
              <p className="text-gray-600">
                Once your order ships, you&amp;apos;ll receive a tracking number via email. You can also track your order by logging into your account on our website.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                Do you offer international shipping?
              </h3>
              <p className="text-gray-600">
                Yes, we ship to many countries worldwide. Shipping rates and delivery times vary by location. Please check our shipping policy for details.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                How do I register my product warranty?
              </h3>
              <p className="text-gray-600">
                You can register your product warranty online by visiting our warranty registration page and entering your product information and proof of purchase.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="bg-red-600 text-white hover:bg-red-700 border-red-600">
              <Link href="/page/faq">
                View All FAQs <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Our customer service team is standing by to help you with any questions or concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" className="bg-white text-red-700 hover:bg-gray-100 border-white">
              <Link href="tel:1-784-456-1857">
                <Phone className="h-4 w-4 mr-2" /> Call Now
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white hover:bg-red-800">
              <Link href="mailto:cdveiraltd@gmail.com">
                <Mail className="h-4 w-4 mr-2" /> Email Support
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}