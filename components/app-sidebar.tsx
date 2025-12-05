'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Braces,
  Database,
  Plus,
  Settings,
  Home,
  ChevronRight,
  Folder,
  Globe,
  Key,
  FileJson,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useApiBuilderStore } from '@/lib/store'
import { useSession } from '@/lib/auth-client'
import { getSubdomain, getBaseDomain } from '@/lib/subdomain'
import { getStoredAuthUser, processAuthToken } from '@/lib/auth-storage'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CreateCollectionDialog } from '@/components/create-collection-dialog'

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  badge?: string | number
  active?: boolean
}

function NavItem({ href, icon, label, badge, active }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              active && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            )}
          >
            <span className="text-muted-foreground">{icon}</span>
            <span className="flex-1 truncate">{label}</span>
            {badge !== undefined && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
                {badge}
              </Badge>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="hidden lg:hidden">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { collections } = useApiBuilderStore()
  const { data: session, isPending } = useSession()
  const [mounted, setMounted] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Process auth token from URL if present
    processAuthToken()
  }, [])

  // Get user from session or localStorage fallback
  const sessionUser = session?.user
  const storedUser = mounted ? getStoredAuthUser() : null
  const user = sessionUser || storedUser
  const username = user ? (sessionUser ? (sessionUser as any).username : storedUser?.username) : null
  const userEmail = sessionUser?.email || storedUser?.email
  const subdomain = mounted ? getSubdomain() : null
  const baseDomain = mounted ? getBaseDomain() : ''
  
  // Show loading state while checking auth
  const isLoading = !mounted || isPending

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Braces className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">API Builder</span>
            {mounted && subdomain && (
              <span className="text-xs text-muted-foreground font-mono">
                {subdomain}.{baseDomain}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          <NavItem
            href="/"
            icon={<LayoutDashboard className="size-4" />}
            label="Dashboard"
            active={pathname === '/'}
          />
        </div>

        {/* Collections Section */}
        <div className="pt-4">
          <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}>
            <div className="flex items-center justify-between px-3 py-2">
              <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown
                  className={cn(
                    'size-3 transition-transform',
                    !collectionsOpen && '-rotate-90'
                  )}
                />
                Collections
              </CollapsibleTrigger>
              <CreateCollectionDialog>
                <Button variant="ghost" size="icon" className="size-6">
                  <Plus className="size-3.5" />
                </Button>
              </CreateCollectionDialog>
            </div>

            <CollapsibleContent className="space-y-1">
              {collections.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <Database className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">No collections yet</p>
                  <CreateCollectionDialog>
                    <Button variant="link" size="sm" className="text-xs mt-1 h-auto p-0">
                      Create your first collection
                    </Button>
                  </CreateCollectionDialog>
                </div>
              ) : (
                collections.map((collection) => (
                  <NavItem
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    icon={<Folder className="size-4" />}
                    label={collection.name}
                    badge={collection.fields.length}
                    active={pathname.startsWith(`/collections/${collection.id}`)}
                  />
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Quick Links */}
        <div className="pt-4">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tools
          </p>
          <div className="space-y-1">
            <NavItem
              href="/settings"
              icon={<Settings className="size-4" />}
              label="Settings"
              active={pathname === '/settings'}
            />
          </div>
        </div>
      </nav>

      {/* Footer / User Section */}
      <div className="border-t p-3">
        {isLoading ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 animate-pulse">
            <div className="size-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-2.5 w-28 rounded bg-muted" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{username || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail || ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

