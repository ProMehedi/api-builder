'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown, X, Link2, Network, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useApiBuilderStore } from '@/lib/store'
import type { Field, CollectionItem } from '@/lib/types'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface RelationFieldInputProps {
  field: Field
  value: string | string[] | null | undefined
  onChange: (value: string | string[] | null) => void
}

export function RelationFieldInput({ field, value, onChange }: RelationFieldInputProps) {
  const [open, setOpen] = useState(false)
  const { getCollection, getItems } = useApiBuilderStore()

  const isMulti = field.type === 'relation_many'
  const relatedCollectionId = field.relation?.collectionId
  const displayField = field.relation?.displayField

  const relatedCollection = relatedCollectionId ? getCollection(relatedCollectionId) : null
  const relatedItems = relatedCollectionId ? getItems(relatedCollectionId) : []

  // Get display value for an item
  const getDisplayValue = (item: CollectionItem) => {
    if (displayField && item.data[displayField] !== undefined) {
      return String(item.data[displayField])
    }
    // Use first field as fallback
    const firstField = relatedCollection?.fields[0]
    if (firstField && item.data[firstField.name] !== undefined) {
      return String(item.data[firstField.name])
    }
    return `Item ${item.id.slice(0, 8)}`
  }

  // Current selected items
  const selectedIds = useMemo(() => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return [value]
  }, [value])

  const selectedItems = useMemo(() => {
    return selectedIds
      .map((id) => relatedItems.find((item) => item.id === id))
      .filter(Boolean) as CollectionItem[]
  }, [selectedIds, relatedItems])

  if (!relatedCollection) {
    return (
      <div className="text-sm text-muted-foreground italic p-3 border rounded-md bg-muted/30">
        Related collection not found or not configured
      </div>
    )
  }

  if (relatedItems.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic p-3 border rounded-md bg-muted/30">
        No items in &quot;{relatedCollection.name}&quot; yet. Create some items first.
      </div>
    )
  }

  const handleSelect = (itemId: string) => {
    if (isMulti) {
      const currentIds = selectedIds
      if (currentIds.includes(itemId)) {
        // Remove
        const newIds = currentIds.filter((id) => id !== itemId)
        onChange(newIds.length > 0 ? newIds : null)
      } else {
        // Add
        onChange([...currentIds, itemId])
      }
    } else {
      // Single selection
      onChange(itemId === (value as string) ? null : itemId)
      setOpen(false)
    }
  }

  const handleRemove = (itemId: string) => {
    if (isMulti) {
      const newIds = selectedIds.filter((id) => id !== itemId)
      onChange(newIds.length > 0 ? newIds : null)
    } else {
      onChange(null)
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected items display for multi-select */}
      {isMulti && selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="gap-1.5 pr-1 py-1"
            >
              <Network className="size-3 text-violet-500" />
              {getDisplayValue(item)}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            {isMulti ? (
              <span className="text-muted-foreground">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : `Select from ${relatedCollection.name}...`}
              </span>
            ) : (
              <span className={cn(!value && 'text-muted-foreground')}>
                {selectedItems[0]
                  ? (
                    <span className="flex items-center gap-2">
                      <Link2 className="size-3.5 text-violet-500" />
                      {getDisplayValue(selectedItems[0])}
                    </span>
                  )
                  : `Select from ${relatedCollection.name}...`}
              </span>
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${relatedCollection.name}...`} />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {relatedItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id)
                  return (
                    <CommandItem
                      key={item.id}
                      value={getDisplayValue(item)}
                      onSelect={() => handleSelect(item.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {getDisplayValue(item)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {item.id.slice(0, 8)}...
                        </div>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        Linked to{' '}
        <span className="font-medium">{relatedCollection.name}</span>
        {isMulti ? ' (multiple)' : ''}
      </p>
    </div>
  )
}

