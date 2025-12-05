'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Database,
  Code2,
  Copy,
  Settings,
  Trash2,
  Shield,
  Pencil,
  FileJson,
  MoreHorizontal,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

import { useApiBuilderStore } from '@/lib/store'
import type { CollectionItem } from '@/lib/types'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/data-table'
import { ItemFormDialog } from '@/components/item-form-dialog'
import { ApiDocumentation } from '@/components/api-documentation'
import { RouteSettingsTab } from '@/components/route-settings-tab'

interface CollectionPageProps {
  params: Promise<{ id: string }>
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { getCollection, getItems, deleteCollection } = useApiBuilderStore()

  const [mounted, setMounted] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const collection = getCollection(id)
  const items = getItems(id)

  if (!mounted) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-48 rounded bg-muted' />
          <div className='h-4 w-64 rounded bg-muted' />
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='py-12'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <Database className='size-6' />
                </EmptyMedia>
                <EmptyTitle>Collection Not Found</EmptyTitle>
                <EmptyDescription>
                  The collection you&apos;re looking for doesn&apos;t exist or
                  has been deleted.
                </EmptyDescription>
              </EmptyHeader>
              <Button asChild>
                <Link href='/'>Back to Dashboard</Link>
              </Button>
            </Empty>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleEdit = (item: CollectionItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(
      window.location.origin + `/api/${collection.slug}`
    )
    setCopied(true)
    toast.success('API endpoint copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteCollection = () => {
    deleteCollection(collection.id)
    toast.success(`Collection "${collection.name}" deleted`)
    router.push('/')
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Page Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-4'>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
            <Database className='size-6 text-primary' />
          </div>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold tracking-tight'>
                {collection.name}
              </h1>
              <Badge variant='secondary' className='font-normal'>
                {items.length} items
              </Badge>
            </div>
            {collection.description ? (
              <p className='text-muted-foreground mt-1'>
                {collection.description}
              </p>
            ) : (
              <button
                onClick={handleCopyEndpoint}
                className='flex items-center gap-1.5 mt-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono'
              >
                <Code2 className='size-3.5' />
                /api/{collection.slug}
                {copied ? (
                  <Check className='size-3 text-green-500' />
                ) : (
                  <Copy className='size-3' />
                )}
              </button>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleCopyEndpoint}>
                <Copy className='size-4' />
                Copy API Endpoint
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/collections/${collection.id}/edit`}>
                  <Pencil className='size-4' />
                  Edit Schema
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className='size-4' />
                    Delete Collection
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{collection.name}&quot;
                      and all {items.length} items. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCollection}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Delete Collection
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild>
            <Link href={`/collections/${collection.id}/items/new`}>
              <Plus className='size-4' />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='data' className='space-y-6'>
        <TabsList className='bg-muted/50'>
          <TabsTrigger
            value='data'
            className='gap-2 data-[state=active]:bg-background'
          >
            <FileJson className='size-4' />
            Content
          </TabsTrigger>
          <TabsTrigger
            value='schema'
            className='gap-2 data-[state=active]:bg-background'
          >
            <Settings className='size-4' />
            Schema
          </TabsTrigger>
          <TabsTrigger
            value='api'
            className='gap-2 data-[state=active]:bg-background'
          >
            <Code2 className='size-4' />
            API
          </TabsTrigger>
          <TabsTrigger
            value='routes'
            className='gap-2 data-[state=active]:bg-background'
          >
            <Shield className='size-4' />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value='data' className='space-y-4'>
          {items.length === 0 ? (
            <Card className='border-dashed'>
              <CardContent className='py-12'>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <FileJson className='size-6' />
                    </EmptyMedia>
                    <EmptyTitle>No items yet</EmptyTitle>
                    <EmptyDescription>
                      Create your first item in this collection. You can also
                      use the API to add items programmatically.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button asChild>
                    <Link href={`/collections/${collection.id}/items/new`}>
                      <Plus className='size-4' />
                      Create First Item
                    </Link>
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='p-0'>
                <DataTable
                  collection={collection}
                  items={items}
                  onEdit={handleEdit}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value='schema' className='space-y-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
              <div>
                <CardTitle>Field Schema</CardTitle>
                <CardDescription>
                  {collection.fields.length} field
                  {collection.fields.length !== 1 ? 's' : ''} defined
                </CardDescription>
              </div>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/collections/${collection.id}/edit`}>
                  <Pencil className='size-4' />
                  Edit Schema
                </Link>
              </Button>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='border-t divide-y'>
                {collection.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='flex items-center gap-4 px-6 py-3'
                  >
                    <div className='flex size-8 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground'>
                      {index + 1}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium font-mono text-sm'>
                          {field.name}
                        </span>
                        {field.required && (
                          <Badge variant='secondary' className='text-xs'>
                            Required
                          </Badge>
                        )}
                      </div>
                      {field.description && (
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          {field.description}
                        </p>
                      )}
                    </div>
                    <Badge variant='outline' className='font-mono text-xs'>
                      {field.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value='api'>
          <ApiDocumentation collection={collection} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='routes'>
          <RouteSettingsTab collection={collection} />
        </TabsContent>
      </Tabs>

      {/* Quick Edit Dialog */}
      <ItemFormDialog
        collection={collection}
        item={editingItem}
        open={formOpen}
        onOpenChange={handleCloseForm}
      />
    </div>
  )
}
