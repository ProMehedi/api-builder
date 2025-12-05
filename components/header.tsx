"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Braces, Globe } from "lucide-react"

import { useUserStore } from "@/lib/user-store"
import { getSubdomain, buildRootUrl } from "@/lib/subdomain"

import { Badge } from "@/components/ui/badge"
import { UserDropdown } from "@/components/user-dropdown"

export function Header() {
  const { user } = useUserStore()
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSubdomain(getSubdomain())
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <Braces className="size-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              API Builder
            </span>
          </Link>

          {/* Show subdomain badge when on a user's workspace */}
          {mounted && subdomain && (
            <Badge
              variant="secondary"
              className="font-mono text-xs gap-1.5 hidden sm:flex"
            >
              <Globe className="size-3" />
              {subdomain}
            </Badge>
          )}
        </div>

        <nav className="flex items-center gap-2">
          {/* Show link to main site when on subdomain */}
          {mounted && subdomain && (
            <a
              href={buildRootUrl()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              api-builder.com
            </a>
          )}

          <UserDropdown />
        </nav>
      </div>
    </header>
  )
}
