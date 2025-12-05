"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Globe,
  Save,
  AlertCircle,
  Check,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { useSession, authClient } from "@/lib/auth-client"
import {
  isValidUsername,
  isReservedUsername,
  generateUsername,
} from "@/lib/user-types"
import {
  buildSubdomainUrl,
  getBaseDomain,
  navigateToSubdomain,
} from "@/lib/subdomain"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const user = session?.user
  const currentUsername = user ? (user as any).username : ""
  const currentDisplayName = user ? ((user as any).displayName || user.name || "") : ""

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      setDisplayName(currentDisplayName)
      setNewUsername(currentUsername)
    }
  }, [user, currentUsername, currentDisplayName])

  useEffect(() => {
    if (!user) return
    const changed =
      displayName !== currentDisplayName ||
      newUsername !== currentUsername
    setHasChanges(changed)
  }, [displayName, newUsername, user, currentDisplayName, currentUsername])

  // Validate username on change
  useEffect(() => {
    if (!newUsername) {
      setUsernameError("Username is required")
      return
    }

    if (newUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return
    }

    if (newUsername.length > 30) {
      setUsernameError("Username must be 30 characters or less")
      return
    }

    if (!isValidUsername(newUsername)) {
      setUsernameError(
        "Username must be lowercase letters, numbers, and hyphens only"
      )
      return
    }

    if (isReservedUsername(newUsername)) {
      setUsernameError("This username is reserved")
      return
    }

    setUsernameError(null)
  }, [newUsername])

  const handleGenerateUsername = () => {
    setNewUsername(generateUsername())
  }

  const handleSave = async () => {
    if (!user) return
    if (usernameError) {
      toast.error(usernameError)
      return
    }

    setSaving(true)

    try {
      const usernameChanged = newUsername !== currentUsername
      const nameChanged = displayName !== currentDisplayName

      // Update display name if changed
      if (nameChanged) {
        await authClient.updateUser({
          name: displayName.trim() || undefined,
        })
      }

      // Update username if changed (using username plugin)
      if (usernameChanged) {
        const result = await (authClient as any).changeUsername({
          newUsername: newUsername,
        })

        if (result?.error) {
          toast.error(result.error.message || "Failed to update username")
          setSaving(false)
          return
        }
      }

      toast.success("Settings saved successfully")
      setHasChanges(false)
      setSaving(false)
      router.refresh()
    } catch (error) {
      console.error("Settings error:", error)
      toast.error("Failed to save settings")
      setSaving(false)
    }
  }

  if (!mounted || isPending) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-muted mb-4" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const baseDomain = getBaseDomain()
  const previewUrl = `${newUsername}.${baseDomain}`

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
            <User className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and workspace settings
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear across the app
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Workspace/Subdomain Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Workspace URL
            </CardTitle>
            <CardDescription>
              Your unique subdomain for accessing your API Builder workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Subdomain</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  placeholder="my-workspace"
                  value={newUsername}
                  onChange={(e) =>
                    setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  className={usernameError ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateUsername}
                  title="Generate random username"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              {usernameError ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {usernameError}
                </p>
              ) : (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="size-3" />
                  Username is valid
                </p>
              )}
            </div>

            <Separator />

            {/* URL Preview */}
            <div className="space-y-2">
              <Label>Your Workspace URL</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono">{previewUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="shrink-0"
                >
                  <a
                    href={buildSubdomainUrl(newUsername)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                All your collections and APIs will be accessible at this URL
              </p>
            </div>

            {newUsername !== currentUsername && !usernameError && (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertTitle>Username Change</AlertTitle>
                <AlertDescription>
                  Changing your username will update your workspace URL.
                  Your old URL will no longer work.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Endpoints</CardTitle>
            <CardDescription>
              How your APIs are accessed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p>Your collection APIs will be available at:</p>
              <code className="block bg-muted p-2 rounded text-xs font-mono">
                {previewUrl}/api/{"<collection-slug>"}
              </code>
              <p className="text-xs text-muted-foreground">
                Each collection you create gets its own REST API endpoint
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || !!usernameError || saving}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
