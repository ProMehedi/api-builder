'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Braces,
  Database,
  Zap,
  Code2,
  Layers,
  Shield,
  ArrowRight,
  Check,
  Github,
  Globe,
  Sparkles,
  Link2,
  FileJson,
} from 'lucide-react'

import { useSession } from '@/lib/auth-client'
import { getStoredAuthUser } from '@/lib/auth-storage'
import { buildSubdomainUrl } from '@/lib/subdomain'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Database,
    title: 'Visual Schema Builder',
    description: 'Create collections with a drag-and-drop interface. Support for 10+ field types including relations.',
  },
  {
    icon: Zap,
    title: 'Instant REST APIs',
    description: 'Every collection automatically generates full CRUD endpoints. No coding required.',
  },
  {
    icon: Link2,
    title: 'Relations & Population',
    description: 'Link collections together with one-to-many and many-to-many relations. Smart population.',
  },
  {
    icon: Shield,
    title: 'Route Protection',
    description: 'Secure your APIs with API keys. Enable/disable individual routes as needed.',
  },
  {
    icon: Globe,
    title: 'Personal Workspaces',
    description: 'Get your own subdomain workspace. All your collections in one place.',
  },
  {
    icon: Code2,
    title: 'Auto Documentation',
    description: 'Every API comes with auto-generated documentation and code examples.',
  },
]

const FIELD_TYPES = [
  'String', 'Number', 'Boolean', 'Email', 'URL', 
  'Date', 'DateTime', 'Text', 'Select', 'JSON', 
  'Relation', 'Relation Many'
]

export function LandingPage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get user from session or localStorage
  const sessionUser = session?.user
  const storedUser = mounted ? getStoredAuthUser() : null
  const user = sessionUser || storedUser
  const username = user 
    ? (sessionUser ? (sessionUser as any).username : storedUser?.username) 
    : null

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
              <Sparkles className="size-3.5" />
              Open Source & Free
            </Badge>

            {/* Logo */}
            <div className="mb-8 flex size-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Braces className="size-10 text-primary-foreground" />
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Build REST APIs
              <br />
              <span className="text-primary">in Minutes</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Create collections, define schemas, and get fully functional CRUD APIs instantly. 
              No backend coding required. Your own workspace, your own subdomain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {user && username ? (
                <Button size="lg" className="gap-2" asChild>
                  <a href={buildSubdomainUrl(username)}>
                    Go to Workspace
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href="https://github.com/promehedi/api-builder" target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" />
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                Self-hosted option
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                MIT Licensed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to build APIs
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From schema design to API documentation, we've got you covered.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-2 transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Field Types Section */}
      <section className="border-b py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4">Field Types</Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                12+ Field Types
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                From simple strings to complex relations, define your data exactly how you need it.
                Each field type comes with proper validation and type safety.
              </p>
              <div className="flex flex-wrap gap-2">
                {FIELD_TYPES.map((type) => (
                  <Badge key={type} variant="secondary" className="font-mono text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border-2 bg-card p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileJson className="size-4 text-muted-foreground" />
                    <span className="font-mono text-sm">title</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">string</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileJson className="size-4 text-muted-foreground" />
                    <span className="font-mono text-sm">content</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">text</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileJson className="size-4 text-muted-foreground" />
                    <span className="font-mono text-sm">author</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">relation</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileJson className="size-4 text-muted-foreground" />
                    <span className="font-mono text-sm">tags</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">relation_many</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileJson className="size-4 text-muted-foreground" />
                    <span className="font-mono text-sm">published</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">boolean</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Example Section */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">REST API</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Auto-generated endpoints
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Every collection gets a full set of CRUD endpoints automatically.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border-2 bg-card">
            <div className="border-b bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500" />
                <div className="size-3 rounded-full bg-yellow-500" />
                <div className="size-3 rounded-full bg-green-500" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">API Endpoints</span>
              </div>
            </div>
            <div className="p-4 font-mono text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
                  <span className="text-muted-foreground">/api/posts</span>
                  <span className="ml-auto text-xs text-muted-foreground">List all items</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
                  <span className="text-muted-foreground">/api/posts/:id</span>
                  <span className="ml-auto text-xs text-muted-foreground">Get single item</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
                  <span className="text-muted-foreground">/api/posts</span>
                  <span className="ml-auto text-xs text-muted-foreground">Create item</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">PUT</Badge>
                  <span className="text-muted-foreground">/api/posts/:id</span>
                  <span className="ml-auto text-xs text-muted-foreground">Update item</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">DELETE</Badge>
                  <span className="text-muted-foreground">/api/posts/:id</span>
                  <span className="ml-auto text-xs text-muted-foreground">Delete item</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to build your API?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Get started in seconds. No credit card required.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {user && username ? (
              <Button size="lg" className="gap-2" asChild>
                <a href={buildSubdomainUrl(username)}>
                  Go to Workspace
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" className="gap-2" asChild>
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <Braces className="size-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">API Builder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by{' '}
              <a href="https://promehedi.com" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                Mehedi Hasan
              </a>
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/promehedi/api-builder" className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

