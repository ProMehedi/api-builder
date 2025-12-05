"use client"

import { useState } from "react"
import Link from "next/link"
import { Braces, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { signIn } from "@/lib/auth-client"
import { buildSubdomainUrl } from "@/lib/subdomain"
import { storeAuthUser, buildAuthRedirectUrl } from "@/lib/auth-storage"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signIn.email({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || "Failed to sign in")
        setLoading(false)
        return
      }

      // Get user data from the response
      const user = data?.user as { id: string; username?: string; email?: string; name?: string } | undefined
      const username = user?.username
      
      // Store user info locally (for same-origin use)
      if (user && username) {
        storeAuthUser({
          id: user.id,
          username: username,
          email: user.email || email,
          name: user.name,
        })
      }
      
      if (username && user) {
        toast.success("Welcome back! Redirecting to your workspace...")
        // Build redirect URL with auth token for cross-subdomain transfer
        const subdomainUrl = buildSubdomainUrl(username)
        const redirectUrl = buildAuthRedirectUrl(subdomainUrl, {
          id: user.id,
          username: username,
          email: user.email || email,
          name: user.name,
        })
        window.location.href = redirectUrl
      } else {
        toast.success("Welcome back!")
        window.location.href = "/"
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
              <Braces className="size-6 text-white" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              API Builder
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

