"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import type { Collection, CollectionItem } from "@/lib/types"
import { useApiBuilderStore } from "@/lib/store"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DataTableProps {
  collection: Collection
  items: CollectionItem[]
  onEdit: (item: CollectionItem) => void
}

type SortDirection = "asc" | "desc" | null

export function DataTable({ collection, items, onEdit }: DataTableProps) {
  const router = useRouter()
  const { deleteItem } = useApiBuilderStore()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null)

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(fieldName)
      setSortDirection("asc")
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    const aValue = a.data[sortField]
    const bValue = b.data[sortField]

    if (aValue === bValue) return 0
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    const comparison = aValue < bValue ? -1 : 1
    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map((item) => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Item ID copied to clipboard")
  }

  const handleDelete = () => {
    if (itemToDelete) {
      deleteItem(collection.id, itemToDelete.id)
      toast.success("Item deleted successfully")
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleBulkDelete = () => {
    selectedItems.forEach((id) => {
      deleteItem(collection.id, id)
    })
    toast.success(`${selectedItems.size} items deleted`)
    setSelectedItems(new Set())
  }

  const handleRowClick = (item: CollectionItem, e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or actions
    const target = e.target as HTMLElement
    if (
      target.closest('[role="checkbox"]') ||
      target.closest("button") ||
      target.closest('[role="menuitem"]')
    ) {
      return
    }
    router.push(`/collections/${collection.id}/items/${item.id}`)
  }

  const renderCellValue = (value: unknown, maxLength = 50) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic text-xs">null</span>
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value ? "True" : "False"}
        </Badge>
      )
    }

    if (typeof value === "object") {
      const jsonStr = JSON.stringify(value)
      return (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
          {jsonStr.slice(0, 30)}
          {jsonStr.length > 30 ? "..." : ""}
        </code>
      )
    }

    const stringValue = String(value)
    if (stringValue.length > maxLength) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                {stringValue.slice(0, maxLength)}...
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="break-words">{stringValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return stringValue
  }

  // Calculate how many fields to show based on total
  const maxVisibleFields = collection.fields.length <= 5 ? collection.fields.length : 3
  const visibleFields = collection.fields.slice(0, maxVisibleFields)
  const hiddenFieldsCount = collection.fields.length - maxVisibleFields

  return (
    <>
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg mb-4">
          <span className="text-sm">
            {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems(new Set())}
            >
              Clear
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="size-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    items.length > 0 && selectedItems.size === items.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              {visibleFields.map((field) => (
                <TableHead
                  key={field.id}
                  className="cursor-pointer select-none"
                  onClick={() => handleSort(field.name)}
                >
                  <div className="flex items-center gap-1">
                    <span>{field.name}</span>
                    {sortField === field.name && (
                      <span className="text-primary">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {hiddenFieldsCount > 0 && (
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground cursor-help">
                          +{hiddenFieldsCount} more
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="font-medium mb-1">Hidden fields:</p>
                        <ul className="text-xs space-y-0.5">
                          {collection.fields.slice(maxVisibleFields).map((f) => (
                            <li key={f.id}>{f.name}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              )}
              <TableHead className="text-right">Updated</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={(e) => handleRowClick(item, e)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item.id, !!checked)
                    }
                    aria-label={`Select item ${item.id}`}
                  />
                </TableCell>
                {visibleFields.map((field) => (
                  <TableCell key={field.id}>
                    {renderCellValue(item.data[field.name])}
                  </TableCell>
                ))}
                {hiddenFieldsCount > 0 && (
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {hiddenFieldsCount} values
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link
                              href={`/collections/${collection.id}/items/${item.id}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/collections/${collection.id}/items/${item.id}`}
                          >
                            <Eye className="size-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/collections/${collection.id}/items/${item.id}/edit`}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Zap className="size-4" />
                          Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopyId(item.id)}
                        >
                          <Copy className="size-4" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with info */}
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <p>
          Showing {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs">Click any row to view full details</p>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
