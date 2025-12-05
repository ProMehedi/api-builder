'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getSubdomain } from '@/lib/subdomain'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'

// Routes that should always show landing/public layout (no sidebar)
const PUBLIC_ROUTES = ['/login', '/signup']

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [subdomain, setSubdomain] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setSubdomain(getSubdomain())
  }, [])

  // Check if we're on a public/auth route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  // Show public layout (no sidebar) for:
  // 1. Root domain (no subdomain) - landing page
  // 2. Auth routes (login, signup)
  const showPublicLayout = !subdomain || isPublicRoute

  if (showPublicLayout) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  // Show app layout with sidebar for subdomain routes
  return (
    <div className="relative flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 pl-64">
        <AppTopbar />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  )
}

