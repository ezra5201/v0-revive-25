"use client"

import { useAuthContext } from "@/lib/auth-context"

/**
 * Hook to access the current authenticated user and loading state
 *
 * @returns {Object} - { user: User | null, isLoading: boolean }
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading } = useAuth()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (!user) return <div>Not logged in</div>
 *
 *   return <div>Welcome, {user.email}</div>
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext()
}
