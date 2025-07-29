'use client'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/routing'
import useSettingStore from '@/hooks/use-setting-store'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignIn } from '@/types'
import { signInWithCredentials } from '@/lib/auth/client-auth'

import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignInSchema } from '@/lib/validator'
import { isRedirectError } from 'next/dist/client/components/redirect'

const signInDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        email: 'admin@cdveiraltd.com',
        password: 'Secure_P@ssw0rd_2023!',
      }
    : {
        email: '',
        password: '',
      }

// Component that uses useSearchParams wrapped in Suspense
function SignInFormContent() {
  const {
    setting: { site },
  } = useSettingStore()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  })

  const { control, handleSubmit } = form

  const router = useRouter()

  const onSubmit = async (data: IUserSignIn) => {
    try {
      const result = await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      
      if (result?.ok) {
        router.push(callbackUrl)
      } else {
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-6'>
          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <Input 
                      className="pl-10 border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 bg-gray-50/50" 
                      placeholder='Enter email address' 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Input
                      className="pl-10 border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 bg-gray-50/50"
                      type='password'
                      placeholder='Enter password'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium" />
              </FormItem>
            )}
          />

          <div className='flex flex-col space-y-4'>
            <div className="flex justify-end">
              <Link
                href='/page/forgot-password'
                className='text-sm text-gray-500 hover:text-primary transition-colors duration-200'
              >
                Forgot your password?
              </Link>
            </div>
            <div>
              <Button 
                type='submit' 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
              >
                <span className="mr-2">Sign In</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
          <div className='text-sm'>
            By signing in, you agree to {site.name}&apos;s{' '}
            <Link href='/page/conditions-of-use'>Conditions of Use</Link> and{' '}
            <Link href='/page/privacy-policy'>Privacy Notice.</Link>
          </div>
        </div>
      </form>
    </Form>
  )
}

// Main export component that wraps SignInFormContent with Suspense
export default function CredentialsSignInForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInFormContent />
    </Suspense>
  )
}
