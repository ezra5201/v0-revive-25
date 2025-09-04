"use client"

import { useState, useEffect, useCallback } from "react"

interface Contact {
  id: number
  date: string
  daysAgo: number
  provider: string
  client: string
  category: string
  servicesRequested?: string[]
  servicesProvided?: Array<{
    service: string
    provider: string
    completedAt: string
  }>
  comments?: string
  hasAlert?: boolean
  alertDetails?: string
  alertSeverity?: string
}

interface FilterData {
  providers: string[]
  categories: string[]
  clients: { name: string }[]
}

interface Filters {
  categories: string[]
  providers: string[]
}

export function useContacts(activeTab: "today" | "all", filters: Filters) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filterData, setFilterData] = useState<FilterData>({
    providers: [],
    categories: [],
    clients: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    console.log("[v0] Fetching contacts for tab:", activeTab, "with filters:", filters)

    try {
      const params = new URLSearchParams()
      params.set("tab", activeTab)

      if (activeTab === "all") {
        if (filters.categories.length) {
          params.set("categories", filters.categories.join(","))
        }
        if (filters.providers.length) {
          params.set("providers", filters.providers.join(","))
        }
      }

      const url = `/api/contacts?${params.toString()}`
      console.log("[v0] Contacts API URL:", url)

      const response = await fetch(url)
      console.log("[v0] Contacts API response status:", response.status)

      if (!response.ok) {
        throw new Error(`Contacts API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Contacts API data:", data)

      if (response.ok) {
        setContacts(data.contacts || [])
      } else {
        setError(data.error || "Failed to fetch contacts")
      }
    } catch (err) {
      console.error("[v0] Contacts fetch error:", err)
      setError(`Failed to connect to server: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, filters])

  const fetchFilterData = useCallback(async () => {
    try {
      const response = await fetch("/api/filters")
      if (response.ok) {
        const data = await response.json()
        setFilterData(data)
      }
    } catch (error) {
      console.error("Failed to fetch filter data:", error)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    fetchFilterData()
  }, [fetchFilterData])

  return {
    contacts,
    filterData,
    isLoading,
    error,
    refetch: fetchContacts,
    refetchFilters: fetchFilterData,
  }
}
