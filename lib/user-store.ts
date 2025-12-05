"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "./user-types"
import { generateId } from "./types"

// Default demo user - use this username for testing subdomains
// e.g., visit demo.localhost:3000
export const DEFAULT_USERNAME = "demo"

interface UserStore {
  user: User | null
  isInitialized: boolean

  // Actions
  initUser: () => User
  updateUser: (updates: Partial<Omit<User, "id" | "createdAt">>) => void
  setUsername: (username: string) => void
  getUser: () => User | null
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,

      initUser: () => {
        const existing = get().user
        if (existing) {
          set({ isInitialized: true })
          return existing
        }

        // Create default demo user
        const now = new Date().toISOString()
        const newUser: User = {
          id: "demo-user-001",
          username: DEFAULT_USERNAME,
          displayName: "Demo User",
          createdAt: now,
          updatedAt: now,
        }

        set({ user: newUser, isInitialized: true })
        return newUser
      },

      updateUser: (updates) => {
        const current = get().user
        if (!current) return

        set({
          user: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })
      },

      setUsername: (username) => {
        const current = get().user
        if (!current) return

        set({
          user: {
            ...current,
            username,
            updatedAt: new Date().toISOString(),
          },
        })
      },

      getUser: () => get().user,
    }),
    {
      name: "api-builder-user",
    }
  )
)

