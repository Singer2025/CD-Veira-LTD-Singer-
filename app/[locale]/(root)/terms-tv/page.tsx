import Image from 'next/image'
import { Button } from '@/components/ui/button'

export async function generateMetadata() {
  return {
    title: 'TV Terms & Conditions - Singer',
    description: 'Terms and conditions for TV purchases and services from Singer',
  }
}

export default async function TermsTVPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner1.jpg"
              alt="TV Terms & Conditions"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                TV Terms & Conditions
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                Important information about your TV purchase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">1. General Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions govern the sale of television products ("TVs") by C. D. Veira Ltd / Singer ("we," "our," or "us") to the customer ("you" or "your"). By purchasing a TV from us, you agree to be bound by these terms and conditions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">2. Product Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on our website and in our stores. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors. The actual color of the product may vary from what is displayed on your computer or mobile device due to monitor/screen settings and limitations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">3. Pricing and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All prices are in Eastern Caribbean Dollars (XCD) and are inclusive of VAT unless otherwise stated. We reserve the right to change prices for products displayed at any time, and to correct pricing errors that may inadvertently occur.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Payment can be made by cash, credit card, or through our hire purchase program. For hire purchase, additional terms and conditions apply, which will be provided separately.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">4. Delivery and Installation</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer free delivery island-wide for all TV purchases. Delivery times will be agreed upon at the time of purchase. We will make reasonable efforts to deliver the product at the agreed time, but we cannot guarantee specific delivery times.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Basic installation services are included with the purchase of select TV models. Basic installation includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Unpacking and inspection of the TV</li>
                <li>Assembly of the TV stand (if applicable)</li>
                <li>Placement of the TV on a suitable surface</li>
                <li>Connection to power and up to two external devices</li>
                <li>Basic setup and channel tuning</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Additional installation services, such as wall mounting, custom wiring, or advanced setup, may be available at an extra cost.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">5. Warranty</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All TVs come with a manufacturer's warranty. The duration and coverage of the warranty vary by brand and model. Details of the warranty will be provided with the product documentation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For warranty claims, you must present your proof of purchase. Warranty does not cover damage caused by misuse, accidents, modifications, or improper installation not performed by our authorized personnel.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">6. Returns and Exchanges</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may return or exchange a TV within 7 days of purchase, provided that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The TV is in its original condition, including all accessories, packaging, and documentation</li>
                <li>You have the original receipt or proof of purchase</li>
                <li>The TV has not been damaged, misused, or modified</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Refunds will be issued in the same form as the original payment. For credit card purchases, please allow 5-7 business days for the refund to appear on your statement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">7. Technical Support</h2>
              <p className="text-gray-700 leading-relaxed">
                We provide technical support for all TVs purchased from us. If you experience any issues with your TV, please contact our customer service department at 1-784-456-1857 or visit our store. Our technical team will assist you in troubleshooting the problem and, if necessary, arrange for repair or replacement under the applicable warranty.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the TV or any related services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on our website. Your continued use of our products and services after any changes indicates your acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these terms and conditions, please contact us at:
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