'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Database,
  Code2,
  Copy,
  Settings,
  Trash2,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'

import { useApiBuilderStore } from '@/lib/store'
import type { CollectionItem } from '@/lib/types'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const collection = getCollection(id)
  const items = getItems(id)

  // Handle hydration
  if (!mounted) {
    return (
      <div className='container mx-auto px-4 py-8 md:px-6'>
        <div className='animate-pulse'>
          <div className='h-8 w-48 rounded bg-muted mb-4' />
          <div className='h-4 w-64 rounded bg-muted' />
        </div>
      </div>
    )
  }

  // Handle collection not found
  if (!collection) {
    return (
      <div className='container mx-auto px-4 py-8 md:px-6'>
        <Empty className='border min-h-[300px]'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Database className='size-6' />
            </EmptyMedia>
            <EmptyTitle>Collection Not Found</EmptyTitle>
            <EmptyDescription>
              The collection you&apos;re looking for doesn&apos;t exist or has
              been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href='/'>Back to Dashboard</Link>
          </Button>
        </Empty>
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
    toast.success('API endpoint copied to clipboard')
  }

  const handleDeleteCollection = () => {
    deleteCollection(collection.id)
    toast.success(`Collection "${collection.name}" deleted`)
    router.push('/')
  }

  return (
    <div className='container mx-auto px-4 py-8 md:px-6'>
      {/* Header */}
      <div className='mb-8'>
        <Button variant='ghost' size='sm' asChild className='mb-4 -ml-2'>
          <Link href='/'>
            <ArrowLeft className='size-4' />
            Back to Collections
          </Link>
        </Button>

        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-start gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md'>
              <Database className='size-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                {collection.name}
              </h1>
              <div className='mt-1 flex flex-wrap items-center gap-2'>
                <button
                  onClick={handleCopyEndpoint}
                  className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono'
                >
                  <Code2 className='size-3.5' />
                  /api/{collection.slug}
                  <Copy className='size-3' />
                </button>
              </div>
              {collection.description && (
                <p className='mt-2 text-sm text-muted-foreground max-w-xl'>
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Trash2 className='size-4' />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{collection.name}&quot;
                    and all {items.length} items. This action cannot be undone.
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
            <Button asChild>
              <Link href={`/collections/${collection.id}/items/new`}>
                <Plus className='size-4' />
                Add Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className='mt-6 flex flex-wrap gap-3'>
          <Badge variant='secondary' className='px-3 py-1'>
            {collection.fields.length} field
            {collection.fields.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant='outline' className='px-3 py-1'>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue='data' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='data' className='gap-2'>
            <Database className='size-4' />
            Data
          </TabsTrigger>
          <TabsTrigger value='api' className='gap-2'>
            <Code2 className='size-4' />
            API Docs
          </TabsTrigger>
          <TabsTrigger value='schema' className='gap-2'>
            <Settings className='size-4' />
            Schema
          </TabsTrigger>
          <TabsTrigger value='routes' className='gap-2'>
            <Shield className='size-4' />
            Routes
          </TabsTrigger>
        </TabsList>

        {/* Data Tab */}
        <TabsContent value='data' className='space-y-4'>
          {items.length === 0 ? (
            <Empty className='border-2 border-dashed min-h-[300px]'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <Database className='size-6' />
                </EmptyMedia>
                <EmptyTitle>No items yet</EmptyTitle>
                <EmptyDescription>
                  Create your first item in this collection. You can also use
                  the API to add items programmatically.
                </EmptyDescription>
              </EmptyHeader>
              <Button asChild>
                <Link href={`/collections/${collection.id}/items/new`}>
                  <Plus className='size-4' />
                  Create First Item
                </Link>
              </Button>
            </Empty>
          ) : (
            <DataTable
              collection={collection}
              items={items}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>

        {/* API Docs Tab */}
        <TabsContent value='api'>
          <ApiDocumentation collection={collection} />
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value='schema' className='space-y-4'>
          <div className='rounded-lg border'>
            <div className='p-4 border-b bg-muted/30'>
              <h3 className='font-medium'>Field Schema</h3>
              <p className='text-sm text-muted-foreground'>
                The fields defined for this collection
              </p>
            </div>
            <div className='divide-y'>
              {collection.fields.map((field) => (
                <div
                  key={field.id}
                  className='flex items-center justify-between p-4'
                >
                  <div className='flex items-center gap-3'>
                    <div className='font-mono text-sm'>{field.name}</div>
                    {field.required && (
                      <Badge variant='secondary' className='text-xs'>
                        Required
                      </Badge>
                    )}
                  </div>
                  <Badge variant='outline'>{field.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Route Settings Tab */}
        <TabsContent value='routes'>
          <RouteSettingsTab collection={collection} />
        </TabsContent>
      </Tabs>

      {/* Item Form Dialog */}
      <ItemFormDialog
        collection={collection}
        item={editingItem}
        open={formOpen}
        onOpenChange={handleCloseForm}
      />
    </div>
  )
}
