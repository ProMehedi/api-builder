// User profile types
export interface User {
  id: string
  username: string
  displayName?: string
  email?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// Generate a random username
export function generateUsername(): string {
  const adjectives = [
    "swift",
    "bold",
    "bright",
    "calm",
    "clever",
    "cool",
    "eager",
    "fast",
    "happy",
    "keen",
    "kind",
    "quick",
    "sharp",
    "smart",
    "wild",
  ]
  const nouns = [
    "api",
    "builder",
    "coder",
    "dev",
    "hacker",
    "maker",
    "ninja",
    "pilot",
    "wizard",
    "pro",
  ]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999)
  return `${adjective}-${noun}-${number}`
}

// Validate username format
export function isValidUsername(username: string): boolean {
  // Must be 3-30 characters, lowercase alphanumeric and hyphens only
  // Cannot start or end with hyphen
  const regex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/
  return regex.test(username)
}

// Reserved subdomains that cannot be used as usernames
export const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "login",
  "signup",
  "auth",
  "mail",
  "email",
  "support",
  "help",
  "docs",
  "blog",
  "status",
  "cdn",
  "static",
  "assets",
  "images",
  "files",
  "download",
  "upload",
  "test",
  "staging",
  "dev",
  "demo",
  "beta",
  "alpha",
]

export function isReservedUsername(username: string): boolean {
  return RESERVED_SUBDOMAINS.includes(username.toLowerCase())
}

