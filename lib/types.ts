// Field types supported by the API Builder
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'email'
  | 'url'
  | 'date'
  | 'datetime'
  | 'text'
  | 'select'
  | 'json'

// Field definition for a collection
export interface Field {
  id: string
  name: string
  type: FieldType
  required: boolean
  defaultValue?: string | number | boolean
  options?: string[] // For select type
  description?: string
}

// Collection schema definition
export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  fields: Field[]
  createdAt: string
  updatedAt: string
}

// Data item for a collection
export interface CollectionItem {
  id: string
  collectionId: string
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Field type metadata for UI
export const FIELD_TYPES: {
  value: FieldType
  label: string
  description: string
  icon: string
}[] = [
  {
    value: 'string',
    label: 'Text',
    description: 'Short text, names, titles',
    icon: 'Type',
  },
  {
    value: 'text',
    label: 'Long Text',
    description: 'Multi-line text, descriptions',
    icon: 'AlignLeft',
  },
  {
    value: 'number',
    label: 'Number',
    description: 'Integer or decimal numbers',
    icon: 'Hash',
  },
  {
    value: 'boolean',
    label: 'Boolean',
    description: 'True or false values',
    icon: 'ToggleLeft',
  },
  {
    value: 'email',
    label: 'Email',
    description: 'Email addresses with validation',
    icon: 'Mail',
  },
  {
    value: 'url',
    label: 'URL',
    description: 'Web addresses and links',
    icon: 'Link',
  },
  {
    value: 'date',
    label: 'Date',
    description: 'Calendar dates',
    icon: 'Calendar',
  },
  {
    value: 'datetime',
    label: 'Date & Time',
    description: 'Date with time',
    icon: 'Clock',
  },
  {
    value: 'select',
    label: 'Select',
    description: 'Dropdown with predefined options',
    icon: 'List',
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured JSON data',
    icon: 'Braces',
  },
]

// Helper to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper to generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
