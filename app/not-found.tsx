import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function NotFound() {
  const { site } = await getSetting()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <Link href="/">
        <Image
          src={site.logo}
          width={200}
          height={60}
          alt={`${site.name} Logo`}
          className="object-contain mb-8"
        />
      </Link>
      <h1 className="text-6xl font-bold text-red-700">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" className="mt-8 px-6 py-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors">
        Go back to Home
      </Link>
    </div>
  )
}