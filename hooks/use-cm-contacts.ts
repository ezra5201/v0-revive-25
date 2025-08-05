"use client"

import { useState, useEffect, useCallback } from "react"

interface Contact {
  id: number
  date: string
  daysAgo: number
  provider: string
  client: string
  category: string
  food: string
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

export function useCMContacts(activeTab: "today" | "all", filters: Filters) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filterData, setFilterData] = useState<FilterData>({
    providers: [],
    categories: [],
    clients: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    if (isLoading) return // Added request deduplication

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set("tab", activeTab)
      params.set("serviceFilter", "cm") // Always add CM filter

      if (activeTab === "all") {
        if (filters.categories.length) {
          params.set("categories", filters.categories.join(","))
        }
        if (filters.providers.length) {
          params.set("providers", filters.providers.join(","))
        }
      }

      const response = await fetch(`/api/contacts?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setContacts(data.contacts || [])
      } else {
        setError(data.error || "Failed to fetch contacts")
        if (data.error && data.error.includes("Too Many")) {
          console.error("Rate limit exceeded:", data.error)
        }
      }
    } catch (err) {
      setError("Failed to connect to server")
      if (err instanceof Error && err.message.includes("Too Many")) {
        console.error("Rate limit exceeded:", err.message)
      }
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
