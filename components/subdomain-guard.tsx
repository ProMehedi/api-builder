'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, Home, User, ArrowRight, Sparkles, LogIn } from 'lucide-react'

import { useSession } from '@/lib/auth-client'
import {
  getSubdomain,
  buildRootUrl,
  buildSubdomainUrl,
  getBaseDomain,
} from '@/lib/subdomain'
import { getStoredUsername, processAuthToken } from '@/lib/auth-storage'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Routes that should bypass subdomain guard
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/settings',
]

// SSR-safe hydration check
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

interface SubdomainGuardProps {
  children: React.ReactNode
}

export function SubdomainGuard({ children }: SubdomainGuardProps) {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()

  // SSR-safe way to detect client-side hydration
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  // Process auth token from URL on client (for cross-subdomain auth)
  if (isClient) {
    processAuthToken()
  }

  const subdomain = isClient ? getSubdomain() : null

  // Allow public routes to render immediately
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname?.startsWith(route)
  )
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Still loading (not on client or session pending)
  if (!isClient || isPending) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center gap-4'>
          <div className='size-12 rounded-xl bg-muted' />
          <div className='h-4 w-32 rounded bg-muted' />
        </div>
      </div>
    )
  }

  // No subdomain - show normal content (root domain)
  if (!subdomain) {
    return <>{children}</>
  }

  // Get username from session or localStorage fallback
  const sessionUser = session?.user
  const sessionUsername = sessionUser
    ? (sessionUser as { username?: string }).username ?? null
    : null

  // Use localStorage as fallback for cross-subdomain auth
  const storedUsername = isClient ? getStoredUsername() : null
  const username = sessionUsername || storedUsername

  // User is logged in (via session or localStorage) and on their own subdomain
  if (username && subdomain === username) {
    return <>{children}</>
  }

  // User is logged in but on wrong subdomain - redirect to their subdomain
  if (username && subdomain !== username) {
    // Show a quick redirect message
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            Redirecting to your workspace...
          </p>
          <Button asChild>
            <a href={buildSubdomainUrl(username)}>
              <Home className='size-4' />
              Go to {username}.{getBaseDomain()}
            </a>
          </Button>
        </div>
      </div>
    )
  }

  // User is NOT logged in on a subdomain - show "workspace not found" page
  return <WorkspaceNotFound subdomain={subdomain} currentUsername={username} />
}

interface WorkspaceNotFoundProps {
  subdomain: string
  currentUsername: string | null
}

function WorkspaceNotFound({
  subdomain,
  currentUsername,
}: WorkspaceNotFoundProps) {
  const baseDomain = getBaseDomain()

  return (
    <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center p-4'>
      <div className='max-w-md w-full text-center'>
        {/* Icon */}
        <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25'>
          <Globe className='size-10 text-white' />
        </div>

        {/* Title */}
        <h1 className='text-2xl font-bold tracking-tight mb-2'>
          Workspace Not Found
        </h1>

        {/* Subdomain badge */}
        <div className='inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-4'>
          <code className='text-sm font-mono text-muted-foreground'>
            {subdomain}.{baseDomain}
          </code>
        </div>

        {/* Description */}
        <p className='text-muted-foreground mb-8'>
          The workspace <strong>&quot;{subdomain}&quot;</strong> doesn&apos;t
          exist or isn&apos;t available. This could mean the username
          hasn&apos;t been claimed yet.
        </p>

        {/* Actions */}
        <div className='space-y-3'>
          {currentUsername ? (
            <>
              <Card className='border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/30'>
                <CardContent className='py-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50'>
                      <User className='size-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='text-left'>
                      <p className='text-sm font-medium'>Your Workspace</p>
                      <code className='text-xs text-muted-foreground font-mono'>
                        {currentUsername}.{baseDomain}
                      </code>
                    </div>
                  </div>
                  <Button className='w-full' asChild>
                    <a href={buildSubdomainUrl(currentUsername)}>
                      <Home className='size-4' />
                      Go to My Workspace
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className='text-sm text-muted-foreground'>or</div>
            </>
          ) : (
            <Card className='border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30 mb-4'>
              <CardContent className='py-4'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50'>
                    <Sparkles className='size-5 text-green-600 dark:text-green-400' />
                  </div>
                  <div className='text-left'>
                    <p className='text-sm font-medium'>Claim this username?</p>
                    <p className='text-xs text-muted-foreground'>
                      Create your workspace at {subdomain}.{baseDomain}
                    </p>
                  </div>
                </div>
                <Button className='w-full' asChild>
                  <Link href='/signup'>
                    <ArrowRight className='size-4' />
                    Sign Up to Claim
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!currentUsername && (
            <Button variant='outline' className='w-full' asChild>
              <Link href='/login'>
                <LogIn className='size-4' />
                Sign In
              </Link>
            </Button>
          )}

          <Button variant='outline' className='w-full' asChild>
            <a href={buildRootUrl()}>
              <Home className='size-4' />
              Go to Homepage
            </a>
          </Button>
        </div>

        {/* Footer hint */}
        <p className='text-xs text-muted-foreground mt-8'>
          Looking for your own workspace?{' '}
          <a
            href={buildRootUrl('/signup')}
            className='text-primary hover:underline'
          >
            Sign up
          </a>{' '}
          to get started.
        </p>
      </div>
    </div>
  )
}
