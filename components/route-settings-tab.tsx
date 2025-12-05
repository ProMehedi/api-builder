"use client"

import { useState } from "react"
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  RefreshCw,
  Settings2,
  Globe,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"

import type { Collection, RouteMethod, RouteSettings } from "@/lib/types"
import { ROUTE_METHODS, getDefaultRouteSettings } from "@/lib/types"
import { useApiBuilderStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RouteSettingsTabProps {
  collection: Collection
}

// Generate a random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'ak_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function RouteSettingsTab({ collection }: RouteSettingsTabProps) {
  const { updateRouteConfig } = useApiBuilderStore()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [editingPath, setEditingPath] = useState<RouteMethod | null>(null)
  
  // Get current settings or defaults
  const settings: RouteSettings = collection.routeSettings || getDefaultRouteSettings()

  const handleToggleEnabled = (method: RouteMethod) => {
    updateRouteConfig(collection.id, method, {
      enabled: !settings[method].enabled,
    })
    toast.success(`${method.replace('_', ' ')} route ${settings[method].enabled ? 'disabled' : 'enabled'}`)
  }

  const handleTogglePrivate = (method: RouteMethod) => {
    const isPrivate = !settings[method].isPrivate
    const updates: Partial<typeof settings[RouteMethod]> = { isPrivate }
    
    // Auto-generate API key when making private
    if (isPrivate && !settings[method].apiKey) {
      updates.apiKey = generateApiKey()
    }
    
    updateRouteConfig(collection.id, method, updates)
    toast.success(`${method.replace('_', ' ')} route is now ${isPrivate ? 'private' : 'public'}`)
  }

  const handleGenerateApiKey = (method: RouteMethod) => {
    const newKey = generateApiKey()
    updateRouteConfig(collection.id, method, { apiKey: newKey })
    toast.success("New API key generated")
  }

  const handleCopyApiKey = (method: RouteMethod) => {
    const key = settings[method].apiKey
    if (key) {
      navigator.clipboard.writeText(key)
      setCopiedKey(method)
      toast.success("API key copied to clipboard")
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const handleUpdateCustomPath = (method: RouteMethod, path: string) => {
    updateRouteConfig(collection.id, method, { 
      customPath: path.trim() || undefined 
    })
    setEditingPath(null)
    toast.success("Custom path updated")
  }

  const getMethodColor = (method: RouteMethod) => {
    const info = ROUTE_METHODS.find(m => m.method === method)
    return info?.color || 'bg-gray-500'
  }

  const getMethodInfo = (method: RouteMethod) => {
    return ROUTE_METHODS.find(m => m.method === method)
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="size-5" />
            Route Configuration
          </CardTitle>
          <CardDescription>
            Configure which API routes are available, customize paths, and set up authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ROUTE_METHODS.map(({ method, httpMethod }) => {
              const config = settings[method]
              return (
                <Badge
                  key={method}
                  variant={config.enabled ? "default" : "secondary"}
                  className="gap-1.5"
                >
                  <span className={`size-2 rounded-full ${config.enabled ? getMethodColor(method) : 'bg-muted-foreground'}`} />
                  {httpMethod}
                  {config.isPrivate && <Lock className="size-3" />}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <div className="space-y-3">
        {ROUTE_METHODS.map(({ method, label, description, httpMethod, path }) => {
          const config = settings[method]
          const info = getMethodInfo(method)
          const currentPath = path(collection.slug, config.customPath)
          
          return (
            <Collapsible key={method}>
              <Card className={!config.enabled ? "opacity-60" : ""}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`${getMethodColor(method)} text-white border-0 font-mono text-xs px-2`}
                        >
                          {httpMethod}
                        </Badge>
                        <div>
                          <CardTitle className="text-base">{label}</CardTitle>
                          <CardDescription className="text-xs">
                            {description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.isPrivate && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="gap-1">
                                  <Lock className="size-3" />
                                  Private
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                Requires API key
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => handleToggleEnabled(method)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <Separator />
                    
                    {/* Route Path */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="size-4" />
                        Route Path
                      </Label>
                      <div className="flex items-center gap-2">
                        {editingPath === method ? (
                          <div className="flex items-center gap-2 flex-1">
                            <code className="text-sm text-muted-foreground">/api/</code>
                            <Input
                              defaultValue={config.customPath || collection.slug}
                              className="font-mono text-sm h-8"
                              placeholder={collection.slug}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateCustomPath(method, e.currentTarget.value)
                                }
                                if (e.key === 'Escape') {
                                  setEditingPath(null)
                                }
                              }}
                              onBlur={(e) => handleUpdateCustomPath(method, e.target.value)}
                              autoFocus
                            />
                            {method === 'GET_ONE' || method === 'PUT' || method === 'DELETE' ? (
                              <code className="text-sm text-muted-foreground">/:id</code>
                            ) : null}
                          </div>
                        ) : (
                          <>
                            <code className="flex-1 text-sm bg-muted px-3 py-1.5 rounded font-mono">
                              {currentPath}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPath(method)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            {config.isPrivate ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                            Private Route
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Require API key authentication
                          </p>
                        </div>
                        <Switch
                          checked={config.isPrivate}
                          onCheckedChange={() => handleTogglePrivate(method)}
                        />
                      </div>

                      {/* API Key Section */}
                      {config.isPrivate && (
                        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Key className="size-4" />
                            API Key
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={config.apiKey || ''}
                              readOnly
                              className="font-mono text-xs"
                              type="password"
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopyApiKey(method)}
                                  >
                                    {copiedKey === method ? (
                                      <Check className="size-4 text-green-500" />
                                    ) : (
                                      <Copy className="size-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy API key</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleGenerateApiKey(method)}
                                  >
                                    <RefreshCw className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Generate new key</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Include header: <code className="bg-background px-1 rounded">X-API-Key: {'<your-key>'}</code>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ROUTE_METHODS.forEach(({ method }) => {
                updateRouteConfig(collection.id, method, { enabled: true })
              })
              toast.success("All routes enabled")
            }}
          >
            <Eye className="size-4" />
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ROUTE_METHODS.forEach(({ method }) => {
                updateRouteConfig(collection.id, method, { enabled: false })
              })
              toast.success("All routes disabled")
            }}
          >
            <EyeOff className="size-4" />
            Disable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ROUTE_METHODS.forEach(({ method }) => {
                const newKey = generateApiKey()
                updateRouteConfig(collection.id, method, { 
                  isPrivate: true, 
                  apiKey: settings[method].apiKey || newKey 
                })
              })
              toast.success("All routes set to private")
            }}
          >
            <Lock className="size-4" />
            Make All Private
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ROUTE_METHODS.forEach(({ method }) => {
                updateRouteConfig(collection.id, method, { isPrivate: false })
              })
              toast.success("All routes set to public")
            }}
          >
            <Unlock className="size-4" />
            Make All Public
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

