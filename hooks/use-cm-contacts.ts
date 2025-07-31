"use client"
import { useContacts } from "./use-contacts"

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

export function useCMContacts(tab: "today" | "all", filters: { categories: string[]; providers: string[] }) {
  return useContacts(tab, filters, "cm")
}
