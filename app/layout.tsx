import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import './custom-theme.css'
import './design-system.css' // Import design system variables

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`min-h-screen ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}