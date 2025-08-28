"use client"

import { useState, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ServicesDisplay } from "./services-display"
import { ServiceTooltip } from "./service-tooltip"
import { Button } from "@/components/ui/button"
import { MessageSquare, AlertTriangle, UserX, Calendar, Tag, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

interface ContactTableProps {
  activeTab: "today" | "all"
  contacts: Contact[]
  isLoading: boolean
  error: string | null
  onClientClick: (clientName: string, isToday?: boolean) => void
  onSelectionChange?: (count: number, selectedIds: number[]) => void
  onUpdateServicesClick?: (contact: Contact) => void
  onClientRowClick?: (clientName: string) => void // NEW: For "All Clients" tab navigation
}

export function ContactTable({
  activeTab,
  contacts,
  isLoading,
  error,
  onClientClick,
  onSelectionChange,
  onUpdateServicesClick,
  onClientRowClick, // NEW: Client row click handler
}: ContactTableProps) {
  // Ensure we always work with an array
  const safeContacts = Array.isArray(contacts) ? contacts : []
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortColumn, setSortColumn] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [clearingAlert, setClearingAlert] = useState<string | null>(null)
  const [servicesVariant, setServicesVariant] = useState<"default" | "badges" | "dots" | "cards" | "progress">("badges")

  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        setSortColumn(column)
        setSortDirection("asc")
      }
    },
    [sortColumn, sortDirection],
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newSelection = checked ? safeContacts.map((row) => row.id) : []
      setSelectedRows(newSelection)
      onSelectionChange?.(newSelection.length, newSelection)
    },
    [safeContacts, onSelectionChange],
  )

  const handleRowSelect = useCallback(
    (id: number, checked: boolean) => {
      const newSelectedRows = checked ? [...selectedRows, id] : selectedRows.filter((rowId) => rowId !== id)

      setSelectedRows(newSelectedRows)
      onSelectionChange?.(newSelectedRows.length, newSelectedRows)
    },
    [selectedRows, onSelectionChange],
  )

  const handleRowClick = useCallback(
    (clientName: string) => {
      if (activeTab === "all" && onClientRowClick) {
        // NEW: Navigate to client master record for "All Clients" tab
        onClientRowClick(clientName)
      } else {
        // PRESERVE: Existing behavior for "Today's Check-ins" tab
        const isToday = activeTab === "today"
        onClientClick(clientName, isToday)
      }
    },
    [activeTab, onClientClick, onClientRowClick],
  )

  const handleClearClientAlert = useCallback(async (clientName: string) => {
    setClearingAlert(clientName)
    try {
      const response = await fetch("/api/alerts/clear-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          resolvedBy: "Andrea Leflore", // TODO: Get from current user context
        }),
      })

      if (response.ok) {
        // Refresh would be handled by parent component
      }
    } catch (error) {
      console.error("Failed to clear client alert:", error)
    } finally {
      setClearingAlert(null)
    }
  }, [])

  const handleTodayRowClick = useCallback(
    (contact: Contact) => {
      onUpdateServicesClick?.(contact)
    },
    [onUpdateServicesClick],
  )

  const variantOptions = [
    { value: "default" as const, label: "Default (Icons)" },
    { value: "badges" as const, label: "Colored Badges" },
    { value: "dots" as const, label: "Large Dots" },
    { value: "cards" as const, label: "Card Style" },
    { value: "progress" as const, label: "Progress Bar" },
  ]

  const getRowBackgroundColor = (hasAlert?: boolean) => {
    if (hasAlert) {
      return "bg-red-50 border-l-4 border-red-400 hover:bg-red-100"
    }
    return "hover:bg-gray-50"
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "text-red-700"
      case "high":
        return "text-red-600"
      case "medium":
        return "text-orange-600"
      case "low":
        return "text-yellow-600"
      default:
        return "text-red-600"
    }
  }

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${getRowBackgroundColor(contact.hasAlert)}`}
      onClick={activeTab === "today" ? () => handleTodayRowClick(contact) : () => handleRowClick(contact.client)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <Checkbox
              checked={selectedRows.includes(contact.id)}
              onCheckedChange={(checked) => handleRowSelect(contact.id, checked as boolean)}
              className="h-5 w-5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg truncate ${contact.hasAlert ? "text-red-900" : "text-black"}`}>
              {contact.client}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <Calendar className="h-4 w-4" />
              <span>{contact.date}</span>
              {activeTab === "all" && (
                <>
                  <span>•</span>
                  <span>{contact.daysAgo} days ago</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alert Section */}
        <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-2">
          {contact.hasAlert ? (
            <div className="flex items-center space-x-2">
              <ServiceTooltip content={contact.alertDetails || "Alert flagged"}>
                <AlertTriangle className={`h-6 w-6 ${getSeverityColor(contact.alertSeverity)} animate-pulse`} />
              </ServiceTooltip>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClearClientAlert(contact.client)}
                disabled={clearingAlert === contact.client}
                className="text-xs h-8 px-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {clearingAlert === contact.client ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-green-600 border-t-transparent" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center space-x-2 mb-3">
        <Tag className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">{contact.category}</span>
      </div>

      {/* Services - Today tab only */}
      {activeTab === "today" && (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <div className="text-sm font-medium text-gray-700 mb-2">Services</div>
          <ServicesDisplay
            servicesRequested={contact.servicesRequested || []}
            servicesProvided={contact.servicesProvided || []}
            className="text-sm"
            variant={servicesVariant}
          />
        </div>
      )}

      {/* Comments/Alerts - Today tab only */}
      {activeTab === "today" && (
        <div onClick={(e) => e.stopPropagation()}>
          {contact.hasAlert && contact.alertDetails ? (
            <div className="text-red-800 font-bold bg-red-100 p-3 rounded border border-red-300 text-sm">
              🚨 {contact.alertDetails}
            </div>
          ) : contact.comments ? (
            <ServiceTooltip content={contact.comments}>
              <div className="flex items-center space-x-2 cursor-help p-2 bg-blue-50 rounded">
                <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-blue-800 truncate">
                  {contact.comments.substring(0, 60)}
                  {contact.comments.length > 60 ? "..." : ""}
                </span>
              </div>
            </ServiceTooltip>
          ) : null}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white">
      {/* Services Display Variant Switcher */}
      {activeTab === "today" && safeContacts.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Services Display:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 bg-transparent">
                    {variantOptions.find((option) => option.value === servicesVariant)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {variantOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setServicesVariant(option.value)}
                      className={servicesVariant === option.value ? "bg-blue-50 text-blue-700" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="text-xs text-gray-500">Test different visualizations</div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-3 py-4 text-left w-12">
                <Checkbox
                  checked={selectedRows.length === safeContacts.length && safeContacts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-3 py-4 text-left w-16">
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Alerts</span>
                </div>
              </th>
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-900">
                <button className="flex items-center space-x-1 hover:text-gray-700" onClick={() => handleSort("date")}>
                  <span>Date</span>
                  {sortColumn === "date" && <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              {activeTab === "all" && (
                <th className="px-3 py-4 text-left text-sm font-medium text-gray-900">
                  <button
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort("daysAgo")}
                  >
                    <span>Days Ago</span>
                    {sortColumn === "daysAgo" && <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </button>
                </th>
              )}
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-900">
                <button
                  className="flex items-center space-x-1 hover:text-gray-700"
                  onClick={() => handleSort("client")}
                >
                  <span>Client</span>
                  {sortColumn === "client" && <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-900">
                <button
                  className="flex items-center space-x-1 hover:text-gray-700"
                  onClick={() => handleSort("category")}
                >
                  <span>Category</span>
                  {sortColumn === "category" && <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              {activeTab === "today" && (
                <>
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-900">Services</th>
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-900">Comments / Alerts</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {safeContacts.map((row) => (
              <tr
                key={row.id}
                className={`cursor-pointer ${getRowBackgroundColor(row.hasAlert)}`}
                onClick={activeTab === "today" ? () => handleTodayRowClick(row) : () => handleRowClick(row.client)}
              >
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onCheckedChange={(checked) => handleRowSelect(row.id, checked as boolean)}
                  />
                </td>
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  {row.hasAlert ? (
                    <div className="flex items-center space-x-1">
                      <ServiceTooltip content={row.alertDetails || "Alert flagged"}>
                        <AlertTriangle className={`h-5 w-5 ${getSeverityColor(row.alertSeverity)} animate-pulse`} />
                      </ServiceTooltip>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClearClientAlert(row.client)}
                        disabled={clearingAlert === row.client}
                        className="text-xs h-6 px-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        {clearingAlert === row.client ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-green-600 border-t-transparent" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">{row.date}</td>
                {activeTab === "all" && <td className="px-3 py-4 text-sm text-gray-900">{row.daysAgo}</td>}
                <td className="px-3 py-4 text-sm">
                  <span className={`font-bold ${row.hasAlert ? "text-red-900" : "text-black"}`}>{row.client}</span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">{row.category}</td>
                {activeTab === "today" && (
                  <>
                    <td className="px-3 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                      <ServicesDisplay
                        servicesRequested={row.servicesRequested || []}
                        servicesProvided={row.servicesProvided || []}
                        variant={servicesVariant}
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 max-w-xs" onClick={(e) => e.stopPropagation()}>
                      {row.hasAlert && row.alertDetails ? (
                        <div className="text-red-800 font-bold bg-red-100 p-2 rounded border border-red-300">
                          🚨 {row.alertDetails}
                        </div>
                      ) : row.comments ? (
                        <ServiceTooltip content={row.comments}>
                          <div className="flex items-center space-x-1 cursor-help">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            <span className="truncate">
                              {row.comments.substring(0, 30)}
                              {row.comments.length > 30 ? "..." : ""}
                            </span>
                          </div>
                        </ServiceTooltip>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {/* Mobile Select All */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedRows.length === safeContacts.length && safeContacts.length > 0}
                onCheckedChange={handleSelectAll}
                className="h-5 w-5"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedRows.length > 0 ? `${selectedRows.length} selected` : "Select all"}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {safeContacts.length} contact{safeContacts.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-gray-200">
          {safeContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      </div>
    </div>
  )
}
