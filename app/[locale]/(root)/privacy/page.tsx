import Image from 'next/image'
import { Button } from '@/components/ui/button'

export async function generateMetadata() {
  return {
    title: 'Privacy Policy - Singer',
    description: 'Learn about Singer\'s privacy policy and how we protect your personal information',
  }
}

export default async function PrivacyPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-[5/1] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/banner3.jpg"
              alt="Privacy Policy"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 py-4 max-w-[80%]">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
                Privacy Policy
              </h1>
              <p className="mt-2 text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
                How we collect, use, and protect your information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                At Singer, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, title, date of birth.</li>
                <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Financial Data</strong> includes payment card details.</li>
                <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                <li><strong>Profile Data</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
                <li><strong>Usage Data</strong> includes information about how you use our website and products.</li>
                <li><strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Generally, we do not rely on consent as a legal basis for processing your personal data although we will get your consent before sending third party direct marketing communications to you via email or text message. You have the right to withdraw consent to marketing at any time by contacting us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements. We may retain your personal data for a longer period in the event of a complaint or if we reasonably believe there is a prospect of litigation in respect to our relationship with you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Your Legal Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Right to withdraw consent.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date at the top of this privacy policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
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