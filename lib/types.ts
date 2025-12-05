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
  routeSettings?: RouteSettings
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

// Route method types
export type RouteMethod = 'GET_ALL' | 'GET_ONE' | 'POST' | 'PUT' | 'DELETE'

// Individual route configuration
export interface RouteConfig {
  enabled: boolean
  customPath?: string // Custom path segment (e.g., "users" instead of slug)
  isPrivate: boolean
  apiKey?: string // API key for private routes
}

// Route settings for a collection
export interface RouteSettings {
  GET_ALL: RouteConfig
  GET_ONE: RouteConfig
  POST: RouteConfig
  PUT: RouteConfig
  DELETE: RouteConfig
}

// Default route settings
export function getDefaultRouteSettings(): RouteSettings {
  return {
    GET_ALL: { enabled: true, isPrivate: false },
    GET_ONE: { enabled: true, isPrivate: false },
    POST: { enabled: true, isPrivate: false },
    PUT: { enabled: true, isPrivate: false },
    DELETE: { enabled: true, isPrivate: false },
  }
}

// Route method metadata for UI
export const ROUTE_METHODS: {
  method: RouteMethod
  label: string
  description: string
  httpMethod: string
  path: (slug: string, customPath?: string) => string
  color: string
}[] = [
  {
    method: 'GET_ALL',
    label: 'List All',
    description: 'Get all items in the collection',
    httpMethod: 'GET',
    path: (slug, customPath) => `/api/${customPath || slug}`,
    color: 'bg-green-500',
  },
  {
    method: 'GET_ONE',
    label: 'Get One',
    description: 'Get a single item by ID',
    httpMethod: 'GET',
    path: (slug, customPath) => `/api/${customPath || slug}/:id`,
    color: 'bg-green-500',
  },
  {
    method: 'POST',
    label: 'Create',
    description: 'Create a new item',
    httpMethod: 'POST',
    path: (slug, customPath) => `/api/${customPath || slug}`,
    color: 'bg-blue-500',
  },
  {
    method: 'PUT',
    label: 'Update',
    description: 'Update an existing item',
    httpMethod: 'PUT',
    path: (slug, customPath) => `/api/${customPath || slug}/:id`,
    color: 'bg-amber-500',
  },
  {
    method: 'DELETE',
    label: 'Delete',
    description: 'Delete an item',
    httpMethod: 'DELETE',
    path: (slug, customPath) => `/api/${customPath || slug}/:id`,
    color: 'bg-red-500',
  },
]

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
