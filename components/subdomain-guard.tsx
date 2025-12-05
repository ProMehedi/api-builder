"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Globe, Home, User, ArrowRight, Sparkles } from "lucide-react"

import { useUserStore, DEFAULT_USERNAME } from "@/lib/user-store"
import { getSubdomain, buildRootUrl, buildSubdomainUrl, getBaseDomain } from "@/lib/subdomain"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SubdomainGuardProps {
  children: React.ReactNode
}

export function SubdomainGuard({ children }: SubdomainGuardProps) {
  const { user, isInitialized, setUsername } = useUserStore()
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentSubdomain = getSubdomain()
    setSubdomain(currentSubdomain)

    // If user is on a valid subdomain (demo or their own), sync the username
    // This helps when localStorage is different per subdomain
    if (currentSubdomain && user && currentSubdomain !== user.username) {
      // If visiting the demo subdomain, update user to match
      if (currentSubdomain === DEFAULT_USERNAME) {
        setUsername(DEFAULT_USERNAME)
      }
    }
  }, [user, setUsername])

  // Still loading
  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="size-12 rounded-xl bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
    )
  }

  // No subdomain - show normal content
  if (!subdomain) {
    return <>{children}</>
  }

  // User is on their own subdomain - show normal content
  if (user && subdomain === user.username) {
    return <>{children}</>
  }

  // Allow demo subdomain for everyone (for testing)
  if (subdomain === DEFAULT_USERNAME) {
    return <>{children}</>
  }

  // User is on a different subdomain - show "workspace not found" page
  return <WorkspaceNotFound subdomain={subdomain} currentUser={user} />
}

interface WorkspaceNotFoundProps {
  subdomain: string
  currentUser: { username: string } | null
}

function WorkspaceNotFound({ subdomain, currentUser }: WorkspaceNotFoundProps) {
  const baseDomain = getBaseDomain()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
          <Globe className="size-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Workspace Not Found
        </h1>

        {/* Subdomain badge */}
        <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-4">
          <code className="text-sm font-mono text-muted-foreground">
            {subdomain}.{baseDomain}
          </code>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          The workspace <strong>&quot;{subdomain}&quot;</strong> doesn&apos;t exist or
          isn&apos;t available. This could mean the username hasn&apos;t been
          claimed yet.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {currentUser ? (
            <>
              <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
                      <User className="size-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Your Workspace</p>
                      <code className="text-xs text-muted-foreground font-mono">
                        {currentUser.username}.{baseDomain}
                      </code>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <a href={buildSubdomainUrl(currentUser.username)}>
                      <Home className="size-4" />
                      Go to My Workspace
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">or</div>
            </>
          ) : (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30 mb-4">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                    <Sparkles className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Claim this username?</p>
                    <p className="text-xs text-muted-foreground">
                      Create your workspace at {subdomain}.{baseDomain}
                    </p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <ArrowRight className="size-4" />
                  Sign Up (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" asChild>
            <a href={buildRootUrl()}>
              <Home className="size-4" />
              Go to Homepage
            </a>
          </Button>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground mt-8">
          Looking for your own workspace?{" "}
          <a href={buildRootUrl()} className="text-primary hover:underline">
            Visit the homepage
          </a>{" "}
          to get started.
        </p>
      </div>
    </div>
  )
}

