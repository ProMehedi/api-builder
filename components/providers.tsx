"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { SyncProvider } from "@/components/sync-provider"
import { UserInitializer } from "@/components/user-initializer"
import { SubdomainGuard } from "@/components/subdomain-guard"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <UserInitializer>
        <SyncProvider>
          <SubdomainGuard>{children}</SubdomainGuard>
        </SyncProvider>
      </UserInitializer>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}

