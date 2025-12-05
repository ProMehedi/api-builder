'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Database,
  Plus,
  Search,
  Folder,
  FileJson,
  ArrowRight,
  Clock,
  Layers,
  Code2,
  Zap,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

import { useApiBuilderStore } from '@/lib/store'
import type { Collection } from '@/lib/types'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { CreateCollectionDialog } from '@/components/create-collection-dialog'

interface CollectionRowProps {
  collection: Collection
  itemCount: number
}

function CollectionRow({ collection, itemCount }: CollectionRowProps) {
  const { deleteCollection } = useApiBuilderStore()

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/api/${collection.slug}`
    )
    toast.success('API endpoint copied!')
  }

  const handleDelete = () => {
    deleteCollection(collection.id)
    toast.success(`"${collection.name}" deleted`)
  }

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      {/* Icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Folder className="size-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{collection.name}</h3>
          <Badge variant="secondary" className="text-xs font-normal shrink-0">
            {collection.fields.length} fields
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="font-mono text-xs">/api/{collection.slug}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{itemCount} items</span>
        </div>
      </div>

      {/* Updated */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Clock className="size-3.5" />
        {formatDistanceToNow(new Date(collection.updatedAt), { addSuffix: true })}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/collections/${collection.id}`}>
              <FileJson className="size-4" />
              View Data
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/collections/${collection.id}/edit`}>
              <Pencil className="size-4" />
              Edit Schema
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyEndpoint}>
            <Copy className="size-4" />
            Copy Endpoint
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Arrow */}
      <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

export function Dashboard() {
  const { collections, getItems } = useApiBuilderStore()
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  )

  // Calculate stats
  const totalItems = collections.reduce(
    (acc, col) => acc + getItems(col.id).length,
    0
  )
  const totalFields = collections.reduce(
    (acc, col) => acc + col.fields.length,
    0
  )

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border bg-card" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API collections and data
          </p>
        </div>
        <CreateCollectionDialog>
          <Button>
            <Plus className="size-4" />
            New Collection
          </Button>
        </CreateCollectionDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{collections.length}</p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Layers className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFields}</p>
                <p className="text-sm text-muted-foreground">Total Fields</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                <FileJson className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Collections</h2>
          {collections.length > 0 && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
        </div>

        {collections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Database className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No collections yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first collection to start building your API.
                    Each collection becomes a full REST API endpoint.
                  </EmptyDescription>
                </EmptyHeader>
                <CreateCollectionDialog>
                  <Button size="lg">
                    <Plus className="size-4" />
                    Create First Collection
                  </Button>
                </CreateCollectionDialog>
              </Empty>
            </CardContent>
          </Card>
        ) : filteredCollections.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No results found</EmptyTitle>
                  <EmptyDescription>
                    No collections match &quot;{search}&quot;
                  </EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredCollections.map((collection) => (
              <CollectionRow
                key={collection.id}
                collection={collection}
                itemCount={getItems(collection.id).length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Start Guide - Only show when no collections */}
      {collections.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 via-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get started with API Builder in three simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Create a Collection</p>
                  <p className="text-sm text-muted-foreground">
                    Define your data structure with custom fields
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Add Data</p>
                  <p className="text-sm text-muted-foreground">
                    Create items in your collection
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Use the API</p>
                  <p className="text-sm text-muted-foreground">
                    Access your data via REST endpoints
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
