"use client"

import { useState, useEffect } from "react"

interface DatabaseState {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  status?: string
}

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      console.log("[v0] Checking database status...")

      try {
        const response = await fetch("/api/setup")

        console.log("[v0] Setup API response status:", response.status)

        if (!response.ok) {
          throw new Error(`Setup API returned ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("[v0] Setup API result:", result)

        setState({
          isInitialized: result.initialized,
          isLoading: false,
          error: result.error || null,
          status: result.status,
        })
      } catch (error) {
        console.error("[v0] Database status check failed:", error)
        setState({
          isInitialized: false,
          isLoading: false,
          error: `Failed to check database status: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    checkDatabaseStatus()
  }, [])

  const initialize = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch("/api/setup", { method: "POST" })
      const result = await response.json()

      if (response.ok) {
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
          status: result.status,
        })
        return result
      } else {
        setState({
          isInitialized: false,
          isLoading: false,
          error: result.error || "Setup failed",
        })
        throw new Error(result.error)
      }
    } catch (error) {
      setState({
        isInitialized: false,
        isLoading: false,
        error: "Failed to initialize database",
      })
      throw error
    }
  }

  return {
    ...state,
    initialize,
  }
}
