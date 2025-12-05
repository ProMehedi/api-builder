'use client'

// Storage key for cross-subdomain auth sync
const AUTH_STORAGE_KEY = 'api-builder-auth-user'
const AUTH_TOKEN_PARAM = 'auth_token'

interface StoredUser {
  id: string
  username: string
  email: string
  name?: string
  timestamp: number
}

// Store user info in localStorage for cross-subdomain access
export function storeAuthUser(user: { id: string; username: string; email: string; name?: string }) {
  if (typeof window === 'undefined') return
  
  const storedUser: StoredUser = {
    ...user,
    timestamp: Date.now(),
  }
  
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedUser))
  } catch (e) {
    console.error('Failed to store auth user:', e)
  }
}

// Get stored user info
export function getStoredAuthUser(): StoredUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    
    const user = JSON.parse(stored) as StoredUser
    
    // Check if stored data is less than 7 days old
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    if (Date.now() - user.timestamp > maxAge) {
      clearStoredAuthUser()
      return null
    }
    
    return user
  } catch (e) {
    console.error('Failed to get stored auth user:', e)
    return null
  }
}

// Clear stored user info
export function clearStoredAuthUser() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear stored auth user:', e)
  }
}

// Get username from storage
export function getStoredUsername(): string | null {
  const user = getStoredAuthUser()
  return user?.username ?? null
}

// Encode user data for URL transfer (base64)
export function encodeAuthToken(user: { id: string; username: string; email: string; name?: string }): string {
  const data: StoredUser = {
    ...user,
    timestamp: Date.now(),
  }
  return btoa(JSON.stringify(data))
}

// Decode user data from URL token
export function decodeAuthToken(token: string): StoredUser | null {
  try {
    const data = JSON.parse(atob(token)) as StoredUser
    return data
  } catch (e) {
    console.error('Failed to decode auth token:', e)
    return null
  }
}

// Build redirect URL with auth token
export function buildAuthRedirectUrl(baseUrl: string, user: { id: string; username: string; email: string; name?: string }): string {
  const token = encodeAuthToken(user)
  const url = new URL(baseUrl)
  url.searchParams.set(AUTH_TOKEN_PARAM, token)
  return url.toString()
}

// Check URL for auth token and store it
export function processAuthToken(): boolean {
  if (typeof window === 'undefined') return false
  
  const url = new URL(window.location.href)
  const token = url.searchParams.get(AUTH_TOKEN_PARAM)
  
  if (token) {
    const user = decodeAuthToken(token)
    if (user) {
      // Store the user data
      storeAuthUser(user)
      
      // Remove token from URL without reload
      url.searchParams.delete(AUTH_TOKEN_PARAM)
      window.history.replaceState({}, '', url.toString())
      
      return true
    }
  }
  
  return false
}

