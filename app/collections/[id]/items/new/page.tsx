'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Database,
  Save,
  RotateCcw,
  Sparkles,
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'

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
  json: <Braces className="size-4" />,
}

interface NewItemPageProps {
  params: Promise<{ id: string }>
}

export default function NewItemPage({ params }: NewItemPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { getCollection, addItem } = useApiBuilderStore()

  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const collection = getCollection(id)

  // Initialize form data with default values
  useEffect(() => {
    if (collection) {
      const initialData: Record<string, unknown> = {}
      collection.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue
        } else if (field.type === 'boolean') {
          initialData[field.name] = false
        } else if (field.type === 'number') {
          initialData[field.name] = ''
        } else {
          initialData[field.name] = ''
        }
      })
      setFormData(initialData)
    }
  }, [collection])

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

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleReset = () => {
    const initialData: Record<string, unknown> = {}
    collection.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue
      } else if (field.type === 'boolean') {
        initialData[field.name] = false
      } else {
        initialData[field.name] = ''
      }
    })
    setFormData(initialData)
    toast.info('Form reset to defaults')
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
      const newItem = addItem(collection.id, processedData)
      toast.success('Item created successfully!')
      router.push(`/collections/${collection.id}/items/${newItem.id}`)
    } catch (error) {
      toast.error('Failed to create item')
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

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/collections/${collection.id}`}>
            <ArrowLeft className="size-4" />
            Back to {collection.name}
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Create New Item
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new item to <span className="font-medium">{collection.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Item Data
            </CardTitle>
            <CardDescription>
              Fill in the fields below to create a new item. Fields marked with * are required.
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

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="size-4" />
            Reset Form
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
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Create Item
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

