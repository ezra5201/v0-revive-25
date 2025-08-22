"use client"

import { useState, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, Calendar, Target, Activity, ChevronDown, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

interface ClientSummary {
  name: string
  category: string
  totalContacts: number
  lastContactDate: string
  daysAgo: number
  activeGoals: number
  recentActivity: string
  hasAlert: boolean
  alertSeverity?: string
}

interface ClientListViewProps {
  contacts: Contact[]
  isLoading: boolean
  error: string | null
  onClientClick: (clientName: string) => void
}

export function ClientListView({ contacts, isLoading, error, onClientClick }: ClientListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "lastContact" | "totalContacts" | "activeGoals">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Transform contacts into client summaries
  const clientSummaries = useMemo(() => {
    const clientMap = new Map<string, ClientSummary>()

    contacts.forEach((contact) => {
      const existing = clientMap.get(contact.client)
      if (existing) {
        existing.totalContacts++
        // Update to most recent contact if this one is more recent
        if (contact.daysAgo < existing.daysAgo) {
          existing.lastContactDate = contact.date
          existing.daysAgo = contact.daysAgo
        }
      } else {
        clientMap.set(contact.client, {
          name: contact.client,
          category: contact.category,
          totalContacts: 1,
          lastContactDate: contact.date,
          daysAgo: contact.daysAgo,
          activeGoals: Math.floor(Math.random() * 5), // TODO: Get real goal count from API
          recentActivity: contact.daysAgo <= 7 ? "Recent" : contact.daysAgo <= 30 ? "This month" : "Older",
          hasAlert: contact.hasAlert || false,
          alertSeverity: contact.alertSeverity,
        })
      }
    })

    return Array.from(clientMap.values())
  }, [contacts])

  // Get unique categories for filtering
  const categories = useMemo(() => {
    return Array.from(new Set(clientSummaries.map((client) => client.category)))
  }, [clientSummaries])

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clientSummaries

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((client) => selectedCategories.includes(client.category))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "lastContact":
          aValue = a.daysAgo
          bValue = b.daysAgo
          break
        case "totalContacts":
          aValue = a.totalContacts
          bValue = b.totalContacts
          break
        case "activeGoals":
          aValue = a.activeGoals
          bValue = b.activeGoals
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [clientSummaries, searchTerm, selectedCategories, sortBy, sortDirection])

  const handleSort = useCallback(
    (column: typeof sortBy) => {
      if (sortBy === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        setSortBy(column)
        setSortDirection("asc")
      }
    },
    [sortBy, sortDirection],
  )

  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategories([])
  }, [])

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case "Recent":
        return "bg-green-100 text-green-800"
      case "This month":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Client: "bg-blue-100 text-blue-800",
      Prospect: "bg-purple-100 text-purple-800",
      "Former Client": "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <div className="h-6 w-6 text-red-600">⚠</div>
            </div>
            <p className="text-red-600 font-medium">Error loading clients</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Search and Filter Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedCategories.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(searchTerm || selectedCategories.length > 0) && (
            <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredAndSortedClients.length}</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredAndSortedClients.filter((c) => c.recentActivity === "Recent").length}
            </div>
            <div className="text-sm text-gray-600">Active This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredAndSortedClients.reduce((sum, c) => sum + c.activeGoals, 0)}
            </div>
            <div className="text-sm text-gray-600">Active Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredAndSortedClients.filter((c) => c.hasAlert).length}
            </div>
            <div className="text-sm text-gray-600">Alerts</div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedClients.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-medium">No clients found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          filteredAndSortedClients.map((client) => (
            <div
              key={client.name}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onClientClick(client.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{client.name}</h3>
                    <Badge className={getCategoryColor(client.category)}>{client.category}</Badge>
                    {client.hasAlert && <Badge variant="destructive">Alert</Badge>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Last: {client.lastContactDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.totalContacts} contacts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.activeGoals} active goals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <Badge className={getActivityColor(client.recentActivity)} variant="secondary">
                        {client.recentActivity}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
