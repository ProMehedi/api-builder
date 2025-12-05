import { betterAuth } from 'better-auth'
import { username } from 'better-auth/plugins'
import Database from 'better-sqlite3'

// For development: accept any localhost subdomain
// In production, you would list specific allowed origins
const getTrustedOrigins = (request: Request): string[] => {
  const origin = request.headers.get('origin')
  if (!origin) return ['http://localhost:3000']

  try {
    const url = new URL(origin)
    // Allow any subdomain of localhost in development
    if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
      return [origin, 'http://localhost:3000']
    }
  } catch {
    // Invalid origin
  }

  return ['http://localhost:3000']
}

export const auth = betterAuth({
  database: new Database('./sqlite.db'),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: getTrustedOrigins,
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: 'localhost', // Share cookies across localhost subdomains (no leading dot for localhost)
    },
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [username()],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})
