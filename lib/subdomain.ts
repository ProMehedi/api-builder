// Subdomain utilities

// Get the base domain from current host
export function getBaseDomain(): string {
  if (typeof window === "undefined") return "localhost:3000"

  const host = window.location.host
  // Handle localhost
  if (host.includes("localhost")) return "localhost:3000"

  // For production, extract base domain
  // e.g., "user.api-builder.com" -> "api-builder.com"
  const parts = host.split(".")
  if (parts.length > 2) {
    return parts.slice(-2).join(".")
  }
  return host
}

// Get subdomain from current host
export function getSubdomain(): string | null {
  if (typeof window === "undefined") return null

  const host = window.location.host

  // Handle localhost with port - check for subdomain pattern
  // e.g., "johndoe.localhost:3000" -> "johndoe"
  if (host.includes("localhost")) {
    const parts = host.split(".")
    if (parts.length > 1 && !parts[0].includes("localhost")) {
      return parts[0]
    }
    return null
  }

  // For production domains
  // e.g., "johndoe.api-builder.com" -> "johndoe"
  const parts = host.split(".")
  if (parts.length > 2) {
    return parts[0]
  }

  return null
}

// Build URL with subdomain
export function buildSubdomainUrl(
  username: string,
  path: string = "/"
): string {
  if (typeof window === "undefined") return path

  const protocol = window.location.protocol
  const baseDomain = getBaseDomain()

  // For localhost, use subdomain.localhost pattern
  if (baseDomain.includes("localhost")) {
    return `${protocol}//${username}.${baseDomain}${path}`
  }

  return `${protocol}//${username}.${baseDomain}${path}`
}

// Build URL for root domain (no subdomain)
export function buildRootUrl(path: string = "/"): string {
  if (typeof window === "undefined") return path

  const protocol = window.location.protocol
  const baseDomain = getBaseDomain()

  return `${protocol}//${baseDomain}${path}`
}

// Check if we're on the root domain (no subdomain)
export function isRootDomain(): boolean {
  return getSubdomain() === null
}

// Navigate to subdomain
export function navigateToSubdomain(username: string, path: string = "/"): void {
  const url = buildSubdomainUrl(username, path)
  window.location.href = url
}

// Navigate to root domain
export function navigateToRoot(path: string = "/"): void {
  const url = buildRootUrl(path)
  window.location.href = url
}

