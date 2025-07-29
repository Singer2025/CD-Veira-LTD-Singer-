'use client'
import { useSearchParams } from 'next/navigation'
import { redirect } from '@/i18n/routing'
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
import { IUserSignUp } from '@/types'
import { registerUser, signInWithCredentials } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { Separator } from '@/components/ui/separator'
import { isRedirectError } from 'next/navigation'

const signUpDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        name: 'john doe',
        email: 'john@cdveiraltd.com',
        password: 'Secure_P@ssw0rd_2023!',
        confirmPassword: 'Secure_P@ssw0rd_2023!',
      }
    : {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      }

// Component that uses useSearchParams wrapped in Suspense
function SignUpFormContent() {
  const {
    setting: { site },
  } = useSettingStore()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignUp) => {
    try {
      const res = await registerUser(data)
      if (!res.success) {
        toast({
          title: 'Error',
          description: res.error,
          variant: 'destructive',
        })
        return
      }
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
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
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-gray-700 font-medium">Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Input 
                      className="pl-10 border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 bg-gray-50/50" 
                      placeholder='Enter your full name' 
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
          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
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
                      placeholder='Confirm password'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium" />
              </FormItem>
            )}
          />
          <div className="space-y-6">
            <div className='text-xs text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100'>
              By creating an account, you agree to {site.name}&apos;s{' '}
              <Link href='/page/conditions-of-use' className="text-primary hover:underline">Conditions of Use</Link> and{' '}
              <Link href='/page/privacy-policy' className="text-primary hover:underline">Privacy Notice</Link>
            </div>
            
            <Button 
              type='submit' 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
            >
              <span className="mr-2">Create Account</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
          
          <Separator className='my-6' />
          
          <div className='text-center'>
            <p className='text-sm text-gray-500 mb-2'>Already have an account?</p>
            <Link 
              className='text-primary hover:underline font-medium' 
              href={`/sign-in?callbackUrl=${callbackUrl}`}
            >
              Sign In to your account
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}

// Main export component that wraps SignUpFormContent with Suspense
export default function CredentialsSignInForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpFormContent />
    </Suspense>
  )
}
