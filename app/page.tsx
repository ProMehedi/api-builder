'use client'

import { useState, useEffect } from 'react'
import { getSubdomain } from '@/lib/subdomain'
import { Dashboard } from '@/components/dashboard'
import { LandingPage } from '@/components/landing-page'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [subdomain, setSubdomain] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setSubdomain(getSubdomain())
  }, [])

  // Show loading skeleton while determining if we're on a subdomain
  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  // If on a subdomain, show the dashboard
  if (subdomain) {
    return <Dashboard />
  }

  // Otherwise, show the landing page
  return <LandingPage />
}
