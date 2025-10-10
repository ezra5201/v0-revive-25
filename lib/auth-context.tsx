"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/user-roles"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual auth logic (e.g., fetch from API, check session)
    // For now, this is a placeholder that simulates loading
    const loadUser = async () => {
      try {
        // Example: const response = await fetch('/api/auth/me')
        // const userData = await response.json()
        // setUser(userData)

        // Placeholder: Set to null (no user logged in)
        setUser(null)
      } catch (error) {
        console.error("Failed to load user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, setUser }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
