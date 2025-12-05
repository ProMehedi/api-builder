"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import {
  ArrowLeft,
  Database,
  Pencil,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  Mail,
  Link as LinkIcon,
  Calendar,
  Clock,
  List,
  Braces,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { useApiBuilderStore } from "@/lib/store"
import type { FieldType } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
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
} from "@/components/ui/alert-dialog"
import { ItemFormDialog } from "@/components/item-form-dialog"

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

interface ItemDetailPageProps {
  params: Promise<{ id: string; itemId: string }>
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const router = useRouter()
  const { id, itemId } = use(params)
  const { getCollection, getItem, deleteItem } = useApiBuilderStore()

  const [mounted, setMounted] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const collection = getCollection(id)
  const item = getItem(id, itemId)

  // Handle hydration
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-muted mb-4" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  // Handle collection not found
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
              The collection you&apos;re looking for doesn&apos;t exist or has
              been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  // Handle item not found
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
              The item you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href={`/collections/${id}`}>Back to Collection</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(item.id)
    setCopiedId(true)
    toast.success("Item ID copied to clipboard")
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleDelete = () => {
    deleteItem(collection.id, item.id)
    toast.success("Item deleted successfully")
    router.push(`/collections/${id}`)
  }

  const renderFieldValue = (
    fieldType: FieldType,
    value: unknown,
    fieldName: string
  ) => {
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-muted-foreground italic text-sm">No value</span>
      )
    }

    switch (fieldType) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "True" : "False"}
          </Badge>
        )

      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-primary hover:underline flex items-center gap-1.5"
          >
            {String(value)}
            <ExternalLink className="size-3" />
          </a>
        )

      case "url":
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1.5 break-all"
          >
            {String(value)}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        )

      case "date":
        try {
          return format(new Date(String(value)), "MMMM d, yyyy")
        } catch {
          return String(value)
        }

      case "datetime":
        try {
          return format(new Date(String(value)), "MMMM d, yyyy 'at' h:mm a")
        } catch {
          return String(value)
        }

      case "json":
        return (
          <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto max-w-full">
            {typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value)}
          </pre>
        )

      case "text":
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {String(value)}
          </p>
        )

      case "number":
        return (
          <span className="font-mono text-lg">{Number(value).toLocaleString()}</span>
        )

      case "select":
        return <Badge variant="outline">{String(value)}</Badge>

      case "string":
      default:
        return <span className="text-sm break-words">{String(value)}</span>
    }
  }

  // Get a display title from the first string field or use ID
  const displayTitle =
    collection.fields
      .filter((f) => f.type === "string" || f.type === "text")
      .map((f) => item.data[f.name])
      .find((v) => v && String(v).trim()) || `Item ${item.id.slice(0, 8)}`

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/collections/${id}`}>
            <ArrowLeft className="size-4" />
            Back to {collection.name}
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <Database className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl line-clamp-2">
                {String(displayTitle)}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 font-mono hover:text-foreground transition-colors"
                >
                  {copiedId ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {item.id.slice(0, 16)}...
                </button>
                <span>•</span>
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this item. This action cannot
                    be undone.
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
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Zap className="size-4" />
              Quick Edit
            </Button>
            <Button asChild>
              <Link href={`/collections/${collection.id}/items/${item.id}/edit`}>
                <Pencil className="size-4" />
                Edit Item
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Field Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {collection.fields.map((field, index) => (
                <div key={field.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {FIELD_ICONS[field.type]}
                      </span>
                      <span className="font-medium text-sm">{field.name}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="pl-6">
                      {renderFieldValue(
                        field.type,
                        item.data[field.name],
                        field.name
                      )}
                    </div>
                    {field.description && (
                      <p className="text-xs text-muted-foreground pl-6">
                        {field.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Item ID</p>
                <button
                  onClick={handleCopyId}
                  className="font-mono text-sm hover:text-primary transition-colors break-all text-left"
                >
                  {item.id}
                </button>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Collection</p>
                <Link
                  href={`/collections/${collection.id}`}
                  className="text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  {collection.name}
                  <ExternalLink className="size-3" />
                </Link>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm">
                  {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm">
                  {format(new Date(item.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground mb-2">
                Access this item via API:
              </div>
              <div className="bg-muted rounded-md p-2 font-mono text-xs break-all">
                GET /api/{collection.slug}/{item.id}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/api/${collection.slug}/${item.id}`
                  )
                  toast.success("API URL copied to clipboard")
                }}
              >
                <Copy className="size-3" />
                Copy API URL
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <ItemFormDialog
        collection={collection}
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}

