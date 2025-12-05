"use client"

import { useEffect } from "react"
import { useUserStore } from "@/lib/user-store"

export function UserInitializer({ children }: { children: React.ReactNode }) {
  const { initUser, isInitialized } = useUserStore()

  useEffect(() => {
    if (!isInitialized) {
      initUser()
    }
  }, [initUser, isInitialized])

  return <>{children}</>
}

