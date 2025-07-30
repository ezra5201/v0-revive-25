"use client"

import { useState, useEffect } from "react"

interface DatabaseStats {
  contacts: number
  clients: number
  providers: number
  alerts: number
  unique_people: number
  master_records_gap: number
  data_consistency_percentage: number
  lastUpdated: string
}

export function useDatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/record-count")
      if (!response.ok) {
        throw new Error("Failed to fetch database statistics")
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
