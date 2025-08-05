"use client"

import { useState, useEffect } from "react"

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
  clients: { name: string }[]
  providers: string[]
  categories: string[]
}

interface UseOTContactsReturn {
  contacts: Contact[]
  filterData: FilterData
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useOTContacts(
  tab: string,
  categories: string[] = [],
  providers: string[] = [],
  sortColumn = "date",
  sortDirection = "desc",
): UseOTContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filterData, setFilterData] = useState<FilterData>({
    clients: [],
    providers: [],
    categories: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async () => {
    if (loading) return // Added request deduplication

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        tab,
        serviceFilter: "ot", // This is the key difference from CM
        sortColumn,
        sortDirection,
      })

      if (categories.length > 0) {
        params.append("categories", categories.join(","))
      }

      if (providers.length > 0) {
        params.append("providers", providers.join(","))
      }

      const response = await fetch(`/api/contacts?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contacts")
      }

      setContacts(data.contacts || [])

      // For filter data, we need to fetch all OT contacts to get proper filter options
      const filterResponse = await fetch("/api/filters?serviceFilter=ot")
      if (filterResponse.ok) {
        const filterData = await filterResponse.json()
        setFilterData(filterData)
      }
    } catch (err) {
      console.error("Error fetching OT contacts:", err)
      if (err instanceof Error && (err.message.includes("Too Many") || err.message.includes("Rate Limit"))) {
        setError("You have reached the rate limit. Please try again later.")
      } else {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [tab, categories, providers, sortColumn, sortDirection])

  return {
    contacts,
    filterData,
    loading,
    error,
    refetch: fetchContacts,
  }
}
