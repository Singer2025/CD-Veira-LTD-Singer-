'use client'
import React from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from '../ui/toaster'
import AppInitializer from './app-initializer'
import { ClientSetting } from '@/types'
import { SessionProvider } from 'next-auth/react'

export default function ClientProviders({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AppInitializer setting={setting}>
        <ThemeProvider
          attribute='class'
          defaultTheme={setting.common.defaultTheme.toLocaleLowerCase()}
        >
          {/* CartSidebar removed for informercial site */}
          <div>{children}</div>
          <Toaster />
        </ThemeProvider>
      </AppInitializer>
    </SessionProvider>
  )
}
