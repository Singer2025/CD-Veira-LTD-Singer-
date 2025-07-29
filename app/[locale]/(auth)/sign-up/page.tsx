import { Metadata } from 'next'
import { redirect } from '@/i18n/routing'
import { getSetting } from '@/lib/actions/setting.actions'

import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SeparatorWithOr from '@/components/shared/separator-or'

import SignUpForm from './signup-form'
import { GoogleSignInForm } from '../sign-in/google-signin-form'

export const metadata: Metadata = {
  title: 'Sign Up',
}

export default async function SignUpPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams
  const { site } = await getSetting()

  const { callbackUrl } = searchParams

  const session = await getServerSession(authOptions)
  if (session) {
    return redirect(callbackUrl || '/')
  }

  return (
    <div className='w-full'>
      <Card className="border-none shadow-lg overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">Create Account</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Join {site.name} today</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <SignUpForm />
            <SeparatorWithOr />
            <div>
              <GoogleSignInForm />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex items-center justify-center space-x-4">
        <span className="h-px w-12 bg-gray-200"></span>
        <span className="text-xs text-gray-400">Secure Registration</span>
        <span className="h-px w-12 bg-gray-200"></span>
      </div>
    </div>
  )
}
