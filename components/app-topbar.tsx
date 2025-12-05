'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Home,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'
import { useApiBuilderStore } from '@/lib/store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserDropdown } from '@/components/user-dropdown'

interface BreadcrumbItem {
  label: string
  href?: string
}

function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const { getCollection, getItem } = useApiBuilderStore()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    if (parts.length === 0) {
      items.push({ label: 'Dashboard' })
    } else if (parts[0] === 'collections') {
      items.push({ label: 'Collections', href: '/' })
      
      if (parts[1]) {
        const collection = getCollection(parts[1])
        if (collection) {
          items.push({ label: collection.name, href: `/collections/${parts[1]}` })
          
          if (parts[2] === 'items') {
            if (parts[3] === 'new') {
              items.push({ label: 'New Item' })
            } else if (parts[3]) {
              const item = getItem(parts[1], parts[3])
              const displayName = item?.data[collection.fields[0]?.name] || `Item ${parts[3].slice(0, 8)}`
              items.push({ label: String(displayName), href: `/collections/${parts[1]}/items/${parts[3]}` })
              
              if (parts[4] === 'edit') {
                items.push({ label: 'Edit' })
              }
            }
          } else if (parts[2] === 'edit') {
            items.push({ label: 'Edit Schema' })
          }
        }
      }
    } else if (parts[0] === 'settings') {
      items.push({ label: 'Settings' })
    } else if (parts[0] === 'login') {
      items.push({ label: 'Sign In' })
    } else if (parts[0] === 'signup') {
      items.push({ label: 'Sign Up' })
    }

    setBreadcrumbs(items)
  }, [pathname, getCollection, getItem])

  return breadcrumbs
}

export function AppTopbar() {
  const { setTheme, theme } = useTheme()
  const breadcrumbs = useBreadcrumbs()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="size-4" />
        </Link>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            {item.href && index < breadcrumbs.length - 1 ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-48 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        )}

        {/* User Menu */}
        <UserDropdown />
      </div>
    </header>
  )
}

