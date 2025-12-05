"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Settings,
  LogOut,
  LogIn,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { useSession, signOut } from "@/lib/auth-client"
import { buildSubdomainUrl, getSubdomain, getBaseDomain, buildRootUrl } from "@/lib/subdomain"
import { clearStoredAuthUser, getStoredAuthUser, processAuthToken } from "@/lib/auth-storage"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function UserDropdown() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [copied, setCopied] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting and process auth token
  if (typeof window !== 'undefined' && !mounted) {
    processAuthToken()
    setMounted(true)
  }

  if (isPending) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="size-5 animate-spin" />
      </Button>
    )
  }

  // Get user from session or localStorage fallback
  const sessionUser = session?.user
  const storedUser = typeof window !== 'undefined' ? getStoredAuthUser() : null
  
  // Use session user if available, otherwise fall back to stored user
  const hasUser = sessionUser || storedUser
  
  // Not logged in - show login button
  if (!hasUser) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">
            <LogIn className="size-4" />
            Sign In
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    )
  }

  // Build user data from session or storage
  const username = sessionUser 
    ? (sessionUser as any).username || "user"
    : storedUser?.username || "user"
  const displayName = sessionUser
    ? (sessionUser as any).displayName || sessionUser.name || username
    : storedUser?.name || username
  const userEmail = sessionUser?.email || storedUser?.email || ""
  const userImage = sessionUser?.image
  const currentSubdomain = getSubdomain()
  const isOnOwnSubdomain = currentSubdomain === username
  const subdomainUrl = buildSubdomainUrl(username)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subdomainUrl)
    setCopied(true)
    toast.success("Your workspace URL copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      // Clear stored auth for cross-subdomain logout
      clearStoredAuthUser()
      toast.success("Signed out successfully")
      // Redirect to root domain
      window.location.href = buildRootUrl()
    } catch (error) {
      toast.error("Failed to sign out")
      setSigningOut(false)
    }
  }

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Avatar className="size-8">
            <AvatarImage src={userImage || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
            <Badge variant="secondary" className="text-xs font-mono w-fit">
              @{username}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Workspace URL */}
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground mb-1.5">Your workspace</p>
          <div className="flex items-center gap-1">
            <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded truncate">
              {username}.{getBaseDomain()}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyUrl}
              className="shrink-0"
            >
              {copied ? (
                <Check className="size-3 text-green-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Go to workspace */}
        {!isOnOwnSubdomain && (
          <DropdownMenuItem asChild>
            <a href={subdomainUrl}>
              <ExternalLink className="size-4" />
              Go to My Workspace
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-destructive focus:text-destructive"
        >
          {signingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
