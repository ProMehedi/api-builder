"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Database, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import type { Field } from "@/lib/types"
import { useApiBuilderStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { FieldEditor, type EditableField } from "@/components/field-editor"

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

export default function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { getCollection, updateCollection, getItems } = useApiBuilderStore()

  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<EditableField[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const collection = getCollection(id)
  const items = getItems(id)

  useEffect(() => {
    setMounted(true)
    if (collection) {
      setName(collection.name)
      setDescription(collection.description || "")
      setFields(collection.fields.map((f) => ({ ...f })))
    }
  }, [collection])

  // Track changes
  useEffect(() => {
    if (!collection) return

    const nameChanged = name !== collection.name
    const descChanged = (description || "") !== (collection.description || "")
    const fieldsChanged =
      JSON.stringify(fields) !== JSON.stringify(collection.fields)

    setHasChanges(nameChanged || descChanged || fieldsChanged)
  }, [name, description, fields, collection])

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

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a collection name")
      return
    }

    const validFields = fields.filter((f) => f.name.trim())
    if (validFields.length === 0) {
      toast.error("Please add at least one field with a name")
      return
    }

    // Check for duplicate field names
    const fieldNames = validFields.map((f) => f.name.toLowerCase())
    if (new Set(fieldNames).size !== fieldNames.length) {
      toast.error("Field names must be unique")
      return
    }

    // Check select fields have options
    const invalidSelects = validFields.filter(
      (f) => f.type === "select" && (!f.options || f.options.length === 0)
    )
    if (invalidSelects.length > 0) {
      toast.error(
        `Select field "${invalidSelects[0].name}" needs at least one option`
      )
      return
    }

    // Clean up fields - remove isNew flag
    const cleanFields: Field[] = validFields.map(({ isNew, ...field }) => field)

    updateCollection(id, {
      name: name.trim(),
      description: description.trim() || undefined,
      fields: cleanFields,
    })

    toast.success("Collection updated successfully")
    setHasChanges(false)
    router.push(`/collections/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/collections/${id}`}>
            <ArrowLeft className="size-4" />
            Back to Collection
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <Database className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Edit Schema
              </h1>
              <p className="text-muted-foreground mt-1">
                Modify the schema for &quot;{collection.name}&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/collections/${id}`}>Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Warning about data */}
        {items.length > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <AlertTriangle className="size-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                This collection has {items.length} existing items
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Removing or renaming fields may affect how existing data is
                displayed. Consider creating a backup first.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="max-w-3xl space-y-8">
        {/* Collection Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Collection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                placeholder="e.g., Products, Users, Posts"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {name && (
                <p className="text-xs text-muted-foreground font-mono">
                  Endpoint: /api/
                  {name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this collection stores..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fields Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fields</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag to reorder • Click to expand and edit
                </p>
              </div>
              <Badge variant="secondary">{fields.length} fields</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FieldEditor
              fields={fields}
              onChange={setFields}
              hasData={items.length > 0}
            />
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        <div className="flex justify-end gap-2 sm:hidden pb-8">
          <Button variant="outline" asChild>
            <Link href={`/collections/${id}`}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
