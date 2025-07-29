import { useLocale } from 'next-intl'
import UserButtonClient from './user-button-client'

export default function UserButton() {
  // Get the locale on the server side using useLocale instead of getLocale
  const locale = useLocale()
  
  // Pass the locale to the client component
  return <UserButtonClient locale={locale} />
}
