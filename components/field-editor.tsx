"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
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
  X,
  Settings2,
} from "lucide-react"
import { toast } from "sonner"

import { FIELD_TYPES, type FieldType, type Field } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

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

export interface EditableField extends Omit<Field, "id"> {
  id: string
  isNew?: boolean
}

interface SortableFieldItemProps {
  field: EditableField
  index: number
  onFieldChange: (
    fieldId: string,
    key: keyof EditableField,
    value: string | boolean | string[] | undefined
  ) => void
  onRemove: (fieldId: string) => void
  canRemove: boolean
  hasData?: boolean
}

function SortableFieldItem({
  field,
  index,
  onFieldChange,
  onRemove,
  canRemove,
  hasData,
}: SortableFieldItemProps) {
  const [isOpen, setIsOpen] = useState(!field.name) // Open by default if new/empty
  const [newOption, setNewOption] = useState("")

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleAddOption = () => {
    if (!newOption.trim()) return
    const currentOptions = field.options || []
    if (currentOptions.includes(newOption.trim())) {
      toast.error("Option already exists")
      return
    }
    onFieldChange(field.id, "options", [...currentOptions, newOption.trim()])
    setNewOption("")
  }

  const handleRemoveOption = (optionToRemove: string) => {
    const currentOptions = field.options || []
    onFieldChange(
      field.id,
      "options",
      currentOptions.filter((o) => o !== optionToRemove)
    )
  }

  const fieldTypeLabel = FIELD_TYPES.find((t) => t.value === field.type)?.label

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card transition-all",
        isDragging && "opacity-50 shadow-lg",
        field.isNew &&
          "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header - Always visible */}
        <div className="flex items-center gap-2 p-3">
          {/* Drag handle */}
          <button
            type="button"
            className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>

          {/* Field number */}
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
              field.isNew
                ? "bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {field.isNew ? "+" : index + 1}
          </div>

          {/* Field info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {FIELD_ICONS[field.type]}
              </span>
              <span className="font-medium truncate">
                {field.name || (
                  <span className="text-muted-foreground italic">
                    Unnamed field
                  </span>
                )}
              </span>
              {field.required && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{fieldTypeLabel}</p>
          </div>

          {/* Actions */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-3 space-y-4">
            {/* Field Name & Type Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`field-name-${field.id}`} className="text-xs">
                  Field Name
                </Label>
                <Input
                  id={`field-name-${field.id}`}
                  placeholder="e.g., title, price, email"
                  value={field.name}
                  onChange={(e) =>
                    onFieldChange(field.id, "name", e.target.value)
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`field-type-${field.id}`} className="text-xs">
                  Field Type
                </Label>
                <Select
                  value={field.type}
                  onValueChange={(value: FieldType) =>
                    onFieldChange(field.id, "type", value)
                  }
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {FIELD_ICONS[type.value]}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select Options - Only show for select type */}
            {field.type === "select" && (
              <div className="space-y-2">
                <Label className="text-xs">Options</Label>
                <div className="space-y-2">
                  {/* Existing options */}
                  {(field.options || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(field.options || []).map((option, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {option}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(option)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add new option */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an option..."
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddOption()
                        }
                      }}
                      className="h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="shrink-0"
                    >
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {(field.options || []).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add at least one option for this select field
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor={`field-desc-${field.id}`} className="text-xs">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id={`field-desc-${field.id}`}
                placeholder="Help text for this field..."
                value={field.description || ""}
                onChange={(e) =>
                  onFieldChange(
                    field.id,
                    "description",
                    e.target.value || undefined
                  )
                }
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Default Value - for certain types */}
            {(field.type === "string" ||
              field.type === "number" ||
              field.type === "boolean") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor={`field-default-${field.id}`}
                  className="text-xs"
                >
                  Default Value{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                {field.type === "boolean" ? (
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      id={`field-default-${field.id}`}
                      checked={field.defaultValue === true}
                      onCheckedChange={(checked) =>
                        onFieldChange(
                          field.id,
                          "defaultValue",
                          checked ? true : undefined
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.defaultValue === true ? "True" : "No default"}
                    </span>
                  </div>
                ) : (
                  <Input
                    id={`field-default-${field.id}`}
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={
                      field.type === "number" ? "0" : "Default value..."
                    }
                    value={
                      field.defaultValue !== undefined
                        ? String(field.defaultValue)
                        : ""
                    }
                    onChange={(e) =>
                      onFieldChange(
                        field.id,
                        "defaultValue",
                        e.target.value || undefined
                      )
                    }
                    className="h-9"
                  />
                )}
              </div>
            )}

            {/* Bottom row: Required toggle and delete */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id={`field-required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    onFieldChange(field.id, "required", checked)
                  }
                />
                <Label
                  htmlFor={`field-required-${field.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Required field
                </Label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(field.id)}
                disabled={!canRemove}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

interface FieldEditorProps {
  fields: EditableField[]
  onChange: (fields: EditableField[]) => void
  hasData?: boolean
}

export function FieldEditor({ fields, onChange, hasData }: FieldEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      onChange(arrayMove(fields, oldIndex, newIndex))
    }
  }

  const handleFieldChange = (
    fieldId: string,
    key: keyof EditableField,
    value: string | boolean | string[] | undefined
  ) => {
    onChange(
      fields.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f))
    )
  }

  const handleAddField = () => {
    const newField: EditableField = {
      id: `new-${crypto.randomUUID()}`,
      name: "",
      type: "string",
      required: false,
      isNew: true,
    }
    onChange([...fields, newField])
  }

  const handleRemoveField = (fieldId: string) => {
    if (fields.length === 1) {
      toast.error("Collection must have at least one field")
      return
    }
    onChange(fields.filter((f) => f.id !== fieldId))
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              index={index}
              onFieldChange={handleFieldChange}
              onRemove={handleRemoveField}
              canRemove={fields.length > 1}
              hasData={hasData}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Field Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddField}
        className="w-full border-dashed border-2 h-12 hover:border-violet-300 hover:bg-violet-50 dark:hover:border-violet-700 dark:hover:bg-violet-950"
      >
        <Plus className="size-4 mr-2" />
        Add New Field
      </Button>
    </div>
  )
}

