"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  User,
  Settings,
  LogOut,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react"
import { toast } from "sonner"

import { useUserStore } from "@/lib/user-store"
import { buildSubdomainUrl, getSubdomain, getBaseDomain } from "@/lib/subdomain"

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
  const { user, initUser, isInitialized } = useUserStore()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isInitialized) {
      initUser()
    }
  }, [initUser, isInitialized])

  if (!mounted || !user) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="size-5" />
      </Button>
    )
  }

  const currentSubdomain = getSubdomain()
  const isOnOwnSubdomain = currentSubdomain === user.username
  const subdomainUrl = buildSubdomainUrl(user.username)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subdomainUrl)
    setCopied(true)
    toast.success("Your workspace URL copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.username.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Avatar className="size-8">
            <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium leading-none">
              {user.displayName || user.username}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono">
                @{user.username}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Workspace URL */}
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground mb-1.5">Your workspace</p>
          <div className="flex items-center gap-1">
            <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded truncate">
              {user.username}.{getBaseDomain()}
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

        <DropdownMenuItem className="text-muted-foreground">
          <LogOut className="size-4" />
          Sign Out
          <span className="ml-auto text-xs">(Coming soon)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

