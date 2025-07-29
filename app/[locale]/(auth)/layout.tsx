import { getSetting } from '@/lib/actions/setting.actions'
import React from 'react'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()
  return (
    <div className='flex flex-col min-h-screen bg-white'>
      {/* Use the shared Header component */}
      <Header />
      
      {/* Main content with decorative elements */}
      <main className='w-full max-w-md mx-auto p-8 relative z-10 flex-1 flex items-center justify-center'>
        {/* Red decorative circle in background */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/4 translate-x-1/4 z-0'></div>
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full translate-y-1/4 -translate-x-1/4 z-0'></div>
        
        {/* Form container */}
        <div className='w-full backdrop-blur-sm z-10'>
          {children}
        </div>
      </main>
      
      {/* Use the shared Footer component */}
      <Footer />
    </div>
  )
}
