"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RecentlyViewedClient {
  name: string
  viewedAt: number
}

interface RecentlyViewedStore {
  clients: RecentlyViewedClient[]
  currentClient: string | null
  addClient: (name: string) => void
  removeClient: (name: string) => void
  setCurrentClient: (name: string | null) => void
  clearAll: () => void
}

const MAX_RECENT_CLIENTS = 10

export const useRecentlyViewed = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      clients: [],
      currentClient: null,

      addClient: (name: string) =>
        set((state) => {
          // Remove if already exists
          const filtered = state.clients.filter((c) => c.name !== name)

          // Add to front
          const updated = [{ name, viewedAt: Date.now() }, ...filtered]

          // Keep only MAX_RECENT_CLIENTS
          const trimmed = updated.slice(0, MAX_RECENT_CLIENTS)

          return { clients: trimmed, currentClient: name }
        }),

      removeClient: (name: string) =>
        set((state) => {
          const filtered = state.clients.filter((c) => c.name !== name)
          const newCurrent = state.currentClient === name ? filtered[0]?.name || null : state.currentClient

          return { clients: filtered, currentClient: newCurrent }
        }),

      setCurrentClient: (name: string | null) =>
        set(() => ({
          currentClient: name,
        })),

      clearAll: () =>
        set(() => ({
          clients: [],
          currentClient: null,
        })),
    }),
    {
      name: "recently-viewed-clients",
    },
  ),
)
