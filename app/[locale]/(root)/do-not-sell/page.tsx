import Image from 'next/image'
import { Button } from '@/components/ui/button'

export async function generateMetadata() {
  return {
    title: 'Do Not Sell My Information - Singer',
    description: 'Learn about your privacy rights and how to opt out of the sale of your personal information',
  }
}

export default async function DoNotSellPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner1.jpg"
              alt="Do Not Sell My Information"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                Do Not Sell My Information
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                Your privacy rights and how to exercise them
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Do Not Sell Content */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                At Singer, we respect your privacy and are committed to providing you with control over your personal information. This page explains your rights regarding the sale of your personal information and how you can exercise these rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">What Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect various types of personal information from you, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Contact information (such as name, address, email address, and phone number)</li>
                <li>Payment information</li>
                <li>Purchase history and preferences</li>
                <li>Demographic information</li>
                <li>Information about your interactions with our website and services</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                For a more detailed description of the information we collect and how we use it, please refer to our <a href="/privacy" className="text-red-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your personal information for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Processing and fulfilling your orders</li>
                <li>Providing customer service and support</li>
                <li>Sending you information about products, services, and promotions</li>
                <li>Improving our website and services</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Your Right to Opt Out</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to opt out of the sale or sharing of your personal information to third parties. While we do not sell your personal information in the traditional sense, we may share certain information with our partners and service providers to enhance your shopping experience and provide you with relevant offers and promotions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">How to Exercise Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                You can exercise your right to opt out of the sale or sharing of your personal information in the following ways:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Option 1: Submit a Request Online</h3>
                <p className="text-gray-700 mb-4">
                  Complete our online form to submit your request. Please provide your name, email address, and any other information that will help us identify your records in our system.
                </p>
                <Button asChild variant="default" className="bg-red-600 hover:bg-red-700">
                  <a href="/contact">Submit Request Online</a>
                </Button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Option 2: Contact Us by Phone</h3>
                <p className="text-gray-700 mb-4">
                  Call our customer service team at 1-784-456-1857 during our business hours to submit your request verbally.
                </p>
                <Button asChild variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  <a href="tel:+17844561857">Call Us Now</a>
                </Button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Option 3: Visit Our Store</h3>
                <p className="text-gray-700 mb-4">
                  Visit our store location and speak with a customer service representative who can assist you with your request.
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Corner of Halifax and Egmont Streets, Kingstown, St. Vincent and the Grenadines
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Verification Process</h2>
              <p className="text-gray-700 leading-relaxed">
                To protect your privacy and ensure the security of your personal information, we may need to verify your identity before processing your request. We may ask you to provide additional information for verification purposes. We will only use this information to verify your identity and process your request.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Response Time</h2>
              <p className="text-gray-700 leading-relaxed">
                We will respond to your request within 45 days of receipt. If we require additional time, we will inform you of the reason and extension period in writing. If we deny your request, we will explain the reasons for the denial and provide information about how to appeal the decision.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Non-Discrimination Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We will not discriminate against you for exercising any of your privacy rights. This means we will not deny you goods or services, charge you different prices, or provide you with a different level of quality for goods or services as a result of you exercising your privacy rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions or concerns about this notice or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700">Email: cdveiraltd@gmail.com</p>
                <p className="text-gray-700">Phone: 1-784-456-1857</p>
                <p className="text-gray-700">Address: Corner of Halifax and Egmont Streets, Kingstown, St. Vincent and the Grenadines</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Last Updated: June 1, 2023
          </p>
        </div>
      </section>
    </div>
  )
}