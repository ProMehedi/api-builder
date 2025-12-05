'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Braces,
  Mail,
  Lock,
  User,
  AtSign,
  Loader2,
  ArrowRight,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { signUp } from '@/lib/auth-client'
import { isValidUsername, isReservedUsername } from '@/lib/user-types'
import { buildSubdomainUrl } from '@/lib/subdomain'
import { storeAuthUser, buildAuthRedirectUrl } from '@/lib/auth-storage'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // Compute username validation - no useEffect needed
  const usernameError = (() => {
    if (!username) return null
    if (username.length < 3) return 'At least 3 characters'
    if (username.length > 30) return 'Maximum 30 characters'
    if (!isValidUsername(username))
      return 'Only lowercase letters, numbers, and hyphens'
    if (isReservedUsername(username)) return 'This username is reserved'
    return null
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !username || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (usernameError) {
      toast.error(usernameError)
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Use the username plugin's signUp method
      const result = await signUp.email({
        email,
        password,
        name,
        username,
      })

      if (result.error) {
        console.error('Signup error:', result.error)
        toast.error(result.error.message || 'Failed to create account')
        setLoading(false)
        return
      }

      // Store user info locally (for same-origin use)
      const user = result.data?.user
      const userData = {
        id: user?.id || '',
        username: username,
        email: email,
        name: name,
      }
      
      if (user) {
        storeAuthUser(userData)
      }

      toast.success('Account created! Redirecting to your workspace...')
      
      // Build redirect URL with auth token for cross-subdomain transfer
      const subdomainUrl = buildSubdomainUrl(username)
      const redirectUrl = buildAuthRedirectUrl(subdomainUrl, userData)
      window.location.href = redirectUrl
    } catch (error) {
      console.error('Signup exception:', error)
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='flex justify-center mb-8'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg'>
              <Braces className='size-6 text-white' />
            </div>
            <span className='text-2xl font-semibold tracking-tight'>
              API Builder
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl'>Create an account</CardTitle>
            <CardDescription>
              Get started with your own API workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    id='name'
                    type='text'
                    placeholder='John Doe'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='pl-10'
                    disabled={loading}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <div className='relative'>
                  <AtSign className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    id='username'
                    type='text'
                    placeholder='johndoe'
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    className={`pl-10 ${
                      usernameError
                        ? 'border-destructive'
                        : username && !usernameError
                        ? 'border-green-500'
                        : ''
                    }`}
                    disabled={loading}
                  />
                </div>
                {username && (
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      usernameError ? 'text-destructive' : 'text-green-600'
                    }`}
                  >
                    {usernameError ? (
                      <>
                        <X className='size-3' />
                        {usernameError}
                      </>
                    ) : (
                      <>
                        <Check className='size-3' />
                        Your workspace: {username}.api-builder.com
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='you@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-10'
                    disabled={loading}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    id='password'
                    type='password'
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='pl-10'
                    disabled={loading}
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  At least 8 characters
                </p>
              </div>

              <Button
                type='submit'
                className='w-full'
                disabled={loading || !!usernameError}
              >
                {loading ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className='size-4' />
                  </>
                )}
              </Button>
            </form>

            <div className='mt-6 text-center text-sm'>
              <span className='text-muted-foreground'>
                Already have an account?{' '}
              </span>
              <Link
                href='/login'
                className='text-primary hover:underline font-medium'
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
