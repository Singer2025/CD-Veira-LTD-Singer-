import { Metadata } from 'next'
import { Link } from '@/i18n/routing'
import { redirect } from '@/i18n/routing'
import Image from 'next/image'

import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import CredentialsSignInForm from './credentials-signin-form'
import { GoogleSignInForm } from './google-signin-form'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams
  const { site } = await getSetting()

  const { callbackUrl = '/' } = searchParams

  const session = await getServerSession(authOptions)
  if (session) {
    return redirect({ href: callbackUrl })
  }

  return (
    <div className='w-full'>
      <Card className="border-none shadow-lg overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Sign in to your {site.name} account</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <CredentialsSignInForm />
            <SeparatorWithOr />
            <div>
              <GoogleSignInForm />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-3">New to {site.name}?</p>

        <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="inline-block w-full">
          <Button 
            className='w-full bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 font-medium' 
            variant='outline'
          >
            Create your {site.name} account
          </Button>
        </Link>
        
        <div className="mt-6 flex items-center justify-center space-x-4">
          <span className="h-px w-12 bg-gray-200"></span>
          <span className="text-xs text-gray-400">Secure Sign-In</span>
          <span className="h-px w-12 bg-gray-200"></span>
        </div>
      </div>
    </div>
  )
}
