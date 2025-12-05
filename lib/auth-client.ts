'use client'

import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

// Always use the root domain for auth requests to share cookies across subdomains
const getAuthBaseURL = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000'

  const { protocol, host } = window.location
  // Remove subdomain if present (e.g., demo.localhost:3000 -> localhost:3000)
  const parts = host.split('.')
  if (parts.length > 1 && parts[0] !== 'localhost') {
    // Has subdomain, remove it
    const rootHost = parts.slice(1).join('.')
    return `${protocol}//${rootHost}`
  }
  return `${protocol}//${host}`
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [usernameClient()],
  fetchOptions: {
    credentials: 'include', // Important for cross-subdomain cookies
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
