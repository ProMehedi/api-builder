'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Database,
  Save,
  RotateCcw,
  Pencil,
  Type,
  Hash,
  Mail,
  Link as LinkIcon,
  Calendar,
  Clock,
  ToggleLeft,
  AlignLeft,
  List,
  Braces,
  Info,
  AlertTriangle,
  Trash2,
  Link2,
  Network,
} from 'lucide-react'
import { toast } from 'sonner'

import { useApiBuilderStore } from '@/lib/store'
import type { FieldType } from '@/lib/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { RelationFieldInput } from '@/components/relation-field-input'

// Field type icons
const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  string: <Type className="size-4" />,
  text: <AlignLeft className="size-4" />,
  number: <Hash className="size-4" />,
  boolean: <ToggleLeft className="size-4" />,
  email: <Mail className="size-4" />,
  url: <LinkIcon className="size-4" />,
  date: <Calendar className="size-4" />,
  datetime: <Clock className="size-4" />,
  select: <List className="size-4" />,
  relation: <Link2 className="size-4" />,
  relation_many: <Network className="size-4" />,
  json: <Braces className="size-4" />,
}

interface EditItemPageProps {
  params: Promise<{ id: string; itemId: string }>
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const router = useRouter()
  const { id, itemId } = use(params)
  const { getCollection, getItem, updateItem, deleteItem } = useApiBuilderStore()

  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const collection = getCollection(id)
  const item = getItem(id, itemId)

  // Initialize form data from item
  useEffect(() => {
    if (collection && item) {
      const initialData: Record<string, unknown> = {}
      collection.fields.forEach((field) => {
        const value = item.data[field.name]
        if (field.type === 'json' && value !== null && value !== undefined) {
          initialData[field.name] = JSON.stringify(value, null, 2)
        } else if (value !== null && value !== undefined) {
          initialData[field.name] = value
        } else if (field.type === 'boolean') {
          initialData[field.name] = false
        } else {
          initialData[field.name] = ''
        }
      })
      setFormData(initialData)
      setOriginalData(initialData)
    }
  }, [collection, item])

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(changed)
  }, [formData, originalData])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-muted mb-4" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Empty className="border min-h-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Database className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Collection Not Found</EmptyTitle>
            <EmptyDescription>
              The collection you&apos;re looking for doesn&apos;t exist.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Empty className="border min-h-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Database className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Item Not Found</EmptyTitle>
            <EmptyDescription>
              The item you&apos;re looking for doesn&apos;t exist or has been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href={`/collections/${id}`}>Back to Collection</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleReset = () => {
    setFormData(originalData)
    toast.info('Changes discarded')
  }

  const handleDelete = () => {
    deleteItem(collection.id, item.id)
    toast.success('Item deleted')
    router.push(`/collections/${collection.id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Validate required fields
    const missingFields = collection.fields
      .filter((f) => f.required && !formData[f.name] && formData[f.name] !== 0 && formData[f.name] !== false)
      .map((f) => f.name)

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
      setSaving(false)
      return
    }

    // Process form data
    const processedData: Record<string, unknown> = {}
    collection.fields.forEach((field) => {
      const value = formData[field.name]
      if (value === '' || value === undefined) {
        processedData[field.name] = null
      } else if (field.type === 'number' && typeof value === 'string') {
        processedData[field.name] = parseFloat(value) || null
      } else if (field.type === 'json' && typeof value === 'string') {
        try {
          processedData[field.name] = JSON.parse(value)
        } catch {
          processedData[field.name] = null
        }
      } else {
        processedData[field.name] = value
      }
    })

    try {
      updateItem(collection.id, item.id, processedData)
      setOriginalData(formData)
      toast.success('Item updated successfully!')
      router.push(`/collections/${collection.id}/items/${item.id}`)
    } catch (error) {
      toast.error('Failed to update item')
      setSaving(false)
    }
  }

  const renderField = (field: (typeof collection.fields)[0]) => {
    const value = formData[field.name]

    switch (field.type) {
      case 'text':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name}...`}
            rows={4}
            className="resize-none"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="0"
            step="any"
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center gap-3 py-2">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {value ? 'True' : 'False'}
            </span>
          </div>
        )

      case 'email':
        return (
          <Input
            type="email"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="email@example.com"
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="https://example.com"
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        )

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        )

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => handleFieldChange(field.name, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'json':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder='{"key": "value"}'
            rows={4}
            className="font-mono text-sm resize-none"
          />
        )

      case 'relation':
      case 'relation_many':
        return (
          <RelationFieldInput
            field={field}
            value={value as string | string[] | null}
            onChange={(v) => handleFieldChange(field.name, v)}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name}...`}
          />
        )
    }
  }

  // Get a display name for the item
  const getItemDisplayName = () => {
    const firstField = collection.fields[0]
    if (firstField) {
      const value = item.data[firstField.name]
      if (value && typeof value === 'string') {
        return value.length > 30 ? value.slice(0, 30) + '...' : value
      }
    }
    return `Item ${item.id.slice(0, 8)}`
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/collections/${collection.id}/items/${item.id}`}>
            <ArrowLeft className="size-4" />
            Back to Item
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
            <Pencil className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Edit Item
            </h1>
            <p className="text-muted-foreground mt-1">
              Editing &quot;{getItemDisplayName()}&quot; in{' '}
              <span className="font-medium">{collection.name}</span>
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this item. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Item
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You have unsaved changes. Don&apos;t forget to save before leaving.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Item Data
            </CardTitle>
            <CardDescription>
              Update the fields below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {collection.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {FIELD_ICONS[field.type]}
                  </span>
                  <Label htmlFor={`field-${field.name}`} className="flex-1 font-medium">
                    {field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Badge variant="outline" className="text-xs font-normal">
                    {field.type}
                  </Badge>
                  {field.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {field.description}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {renderField(field)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="mt-4">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Item Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{item.id}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>{' '}
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>{' '}
              {new Date(item.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={saving || !hasChanges}
          >
            <RotateCcw className="size-4" />
            Discard Changes
          </Button>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

