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

type ViewFilter = "all" | "today" | "cm" | "ot"

export function useContacts(viewFilter: ViewFilter, filters: Filters) {
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

    try {
      const params = new URLSearchParams()

      if (viewFilter === "today") {
        params.set("tab", "today")
      } else {
        params.set("tab", "all")

        if (viewFilter === "cm") {
          params.set("serviceFilter", "cm")
        } else if (viewFilter === "ot") {
          params.set("serviceFilter", "ot")
        }
      }

      if (filters.categories.length) {
        params.set("categories", filters.categories.join(","))
      }
      if (filters.providers.length) {
        params.set("providers", filters.providers.join(","))
      }

      const url = `/api/contacts?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Contacts API returned ${response.status}`)
      }

      const data = await response.json()

      if (response.ok) {
        setContacts(data.contacts || [])
      } else {
        setError(data.error || "Failed to fetch contacts")
      }
    } catch (err) {
      console.error("Contacts fetch error:", err)
      setError(`Failed to connect to server`)
    } finally {
      setIsLoading(false)
    }
  }, [viewFilter, filters])

  const fetchFilterData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (viewFilter === "cm") {
        params.set("serviceFilter", "cm")
      } else if (viewFilter === "ot") {
        params.set("serviceFilter", "ot")
      }

      const url = `/api/filters${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setFilterData(data)
      }
    } catch (error) {
      console.error("Failed to fetch filter data:", error)
    }
  }, [viewFilter])

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
