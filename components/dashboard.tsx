"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Database,
  Plus,
  Search,
  Zap,
  Code2,
  Layers,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Settings,
} from "lucide-react"
import { toast } from "sonner"

import { useApiBuilderStore } from "@/lib/store"
import { useUserStore } from "@/lib/user-store"
import { getSubdomain, buildSubdomainUrl, getBaseDomain } from "@/lib/subdomain"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { CollectionCard } from "@/components/collection-card"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"

export function Dashboard() {
  const { collections } = useApiBuilderStore()
  const { user } = useUserStore()
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const subdomain = mounted ? getSubdomain() : null
  const baseDomain = mounted ? getBaseDomain() : ""
  const isOnOwnWorkspace = subdomain === user?.username

  const handleCopyUrl = () => {
    if (!user) return
    navigator.clipboard.writeText(buildSubdomainUrl(user.username))
    setCopied(true)
    toast.success("Workspace URL copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  // Show loading skeleton while hydrating
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="mt-2 h-4 w-64 rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl border bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Workspace Info Banner */}
      {user && !isOnOwnWorkspace && (
        <Card className="mb-6 border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/30">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <Globe className="size-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your Workspace</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    {user.username}.{baseDomain}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copy URL
                </Button>
                <Button size="sm" asChild>
                  <a href={buildSubdomainUrl(user.username)}>
                    <ExternalLink className="size-4" />
                    Go to Workspace
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Section */}
      {collections.length === 0 ? (
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Zap className="size-10 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            {isOnOwnWorkspace
              ? `Welcome to Your Workspace`
              : "Build APIs in Minutes"}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {isOnOwnWorkspace
              ? "Create collections and get auto-generated REST APIs for your workspace."
              : "Create collections and get auto-generated REST APIs instantly. No backend coding required."}
          </p>

          {/* User workspace info */}
          {user && isOnOwnWorkspace && (
            <div className="mt-6 inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Globe className="size-4 text-violet-500" />
              <code className="text-sm font-mono">
                {user.username}.{baseDomain}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyUrl}
                className="ml-1"
              >
                {copied ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          )}

          {/* Feature highlights */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code2 className="size-4 text-violet-500" />
              Auto REST APIs
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="size-4 text-violet-500" />
              Schema Builder
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="size-4 text-violet-500" />
              Instant CRUD
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Collections
              </h1>
              {isOnOwnWorkspace && user && (
                <Badge variant="secondary" className="font-mono text-xs">
                  @{user.username}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isOnOwnWorkspace
                ? "Manage your API collections and schemas"
                : "Browse and manage API collections"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </Button>
            )}
            <CreateCollectionDialog />
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {collections.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <Empty className="border-2 min-h-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Database className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No collections yet</EmptyTitle>
            <EmptyDescription>
              Create your first collection to start building your API. Each
              collection becomes a full REST API endpoint.
            </EmptyDescription>
          </EmptyHeader>
          <CreateCollectionDialog>
            <Button size="lg">
              <Plus className="size-4" />
              Create First Collection
            </Button>
          </CreateCollectionDialog>
        </Empty>
      ) : filteredCollections.length === 0 ? (
        <Empty className="border min-h-[200px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              No collections match &quot;{search}&quot;. Try a different search
              term.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => setSearch("")}>
            Clear Search
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  )
}
