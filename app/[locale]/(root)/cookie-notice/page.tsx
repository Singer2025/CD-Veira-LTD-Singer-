import Image from 'next/image'
import { Button } from '@/components/ui/button'

export async function generateMetadata() {
  return {
    title: 'Cookie Notice - Singer',
    description: 'Learn about how Singer uses cookies on our website',
  }
}

export default async function CookieNoticePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner3.jpg"
              alt="Cookie Notice"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                Cookie Notice
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                How we use cookies and similar technologies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Notice Content */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners. Cookies help provide a better and more personalized user experience.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.</li>
                <li><strong>Preference Cookies:</strong> These cookies allow the website to remember choices you make (such as your preferred language or the region you are in) and provide enhanced, more personalized features.</li>
                <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and your shopping experience.</li>
                <li><strong>Marketing Cookies:</strong> These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third-party advertisers.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-red-600 pl-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">First-Party Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These are cookies that are set by our website. They are used to improve your browsing experience on our site, such as remembering your login details or language preferences.
                  </p>
                </div>
                
                <div className="border-l-4 border-red-600 pl-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Third-Party Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These are cookies that are set by our partners and service providers. They may be used for analytics, advertising, or social media integration. For example, we use Google Analytics to help us understand how visitors use our site.
                  </p>
                </div>
                
                <div className="border-l-4 border-red-600 pl-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Session Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These cookies are temporary and are deleted when you close your browser. They help us track your movements from page to page so you don't have to provide the same information repeatedly.
                  </p>
                </div>
                
                <div className="border-l-4 border-red-600 pl-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Persistent Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These cookies remain on your device for a set period or until you delete them manually. They help us recognize you as a returning visitor and adapt our website accordingly.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Cookie Management</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The methods for doing so vary from browser to browser, and from version to version. You can however obtain up-to-date information about blocking and deleting cookies via these links:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><a href="https://support.google.com/chrome/answer/95647" className="text-red-600 hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-red-600 hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-red-600 hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-red-600 hover:underline">Microsoft Edge</a></li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Please note that restricting cookies may impact the functionality of our website. For example, you may not be able to use all the features of our site or store your preferences, and some pages may not display properly.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Changes to Our Cookie Notice</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Cookie Notice from time to time. We will notify you of any changes by posting the new Cookie Notice on this page and updating the "Last Updated" date at the bottom of this page. You are advised to review this Cookie Notice periodically for any changes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about our Cookie Notice, please contact us at:
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