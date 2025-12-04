"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { useApiBuilderStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FieldEditor, type EditableField } from "@/components/field-editor"

interface CreateCollectionDialogProps {
  children?: React.ReactNode
}

export function CreateCollectionDialog({
  children,
}: CreateCollectionDialogProps) {
  const router = useRouter()
  const { addCollection } = useApiBuilderStore()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<EditableField[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      type: "string",
      required: true,
    },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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

    const collection = addCollection(
      name.trim(),
      validFields.map(({ id, isNew, ...field }) => field),
      description.trim() || undefined
    )

    toast.success(`Collection "${collection.name}" created successfully`)
    setOpen(false)
    resetForm()
    router.push(`/collections/${collection.id}`)
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setFields([
      {
        id: crypto.randomUUID(),
        name: "",
        type: "string",
        required: true,
      },
    ])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="size-4" />
            New Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Define your collection schema. API routes will be automatically
            generated.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-collection-form"
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 pb-4">
              {/* Collection Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Products, Users, Posts"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
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
              </div>

              <Separator />

              {/* Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Fields</h3>
                    <p className="text-xs text-muted-foreground">
                      Drag to reorder • Click to expand and edit
                    </p>
                  </div>
                  <Badge variant="secondary">{fields.length} fields</Badge>
                </div>

                <FieldEditor fields={fields} onChange={setFields} />
              </div>
            </div>
          </div>

          {/* Fixed footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Collection</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
