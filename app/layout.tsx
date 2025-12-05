import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

import { Providers } from '@/components/providers'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'API Builder - Create REST APIs Instantly',
  description:
    'Build fully functional REST APIs without writing backend code. Create collections, define schemas, and get instant CRUD endpoints.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <div className="flex-1 pl-64">
              <AppTopbar />
              <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
