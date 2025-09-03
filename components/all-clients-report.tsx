"use client"

import { useState, useCallback } from "react"
import { ContactTable } from "@/components/contact-table"
import { ActionBar } from "@/components/action-bar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Users, Activity, TrendingUp } from "lucide-react"
import { Label } from "@/components/ui/label"

interface AllClientsReportProps {
  contacts: any[]
  filterData: any
  isLoading: boolean
  error: any
  selectedCount: number
  selectedContactIds: number[]
  onClientClick: (clientName: string, isToday?: boolean) => void
  onSelectionChange: (count: number, selectedIds: number[]) => void
  onUpdateServicesClick: (contact: any) => void
  onClientRowClick: (clientName: string) => void
  onClientSelect: (clientName: string) => void
  onNewProspect: (searchedName?: string) => void
  onFiltersChange: (filters: { categories: string[]; providers: string[] }) => void
  onServiceCompleted: () => void
  onDateChangeClick: () => void
}

export function AllClientsReport({
  contacts,
  filterData,
  isLoading,
  error,
  selectedCount,
  selectedContactIds,
  onClientClick,
  onSelectionChange,
  onUpdateServicesClick,
  onClientRowClick,
  onClientSelect,
  onNewProspect,
  onFiltersChange,
  onServiceCompleted,
  onDateChangeClick,
}: AllClientsReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month")
  const [filters, setFilters] = useState<{ categories: string[]; providers: string[] }>({
    categories: [],
    providers: [],
  })

  const handleFiltersChange = useCallback(
    (newFilters: { categories: string[]; providers: string[] }) => {
      setFilters(newFilters)
      onFiltersChange(newFilters)
    },
    [onFiltersChange],
  )

  const handleExport = () => {
    console.log("Exporting All Clients Report for", selectedPeriod)
  }

  // Generate period options
  const periodOptions = [
    "Today",
    "This Week",
    "This Month",
    "Last Month",
    "This Quarter",
    "Last Quarter",
    "This Year",
    "All Time",
  ]

  // Calculate statistics
  const totalClients = filterData?.clients?.length || 0
  const totalContacts = contacts?.length || 0
  const activeClients =
    filterData?.clients?.filter((client: any) => contacts?.some((contact: any) => contact.client_name === client.name))
      ?.length || 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Clients Report</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of all client interactions and service delivery</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="period-select" className="text-sm font-medium text-gray-600">
              Period:
            </Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalClients.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{totalContacts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <ActionBar
          activeTab="all"
          selectedCount={selectedCount}
          selectedContactIds={selectedContactIds}
          onExport={() => console.log("Export")}
          clients={filterData?.clients || []}
          onClientSelect={onClientSelect}
          onNewProspect={onNewProspect}
          providers={filterData?.providers || []}
          categories={filterData?.categories || []}
          onFiltersChange={handleFiltersChange}
          onServiceCompleted={onServiceCompleted}
          onDateChangeClick={onDateChangeClick}
        />
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Client Interactions</h2>
          <p className="text-sm text-gray-600 mt-1">Complete record of all client contacts and services provided</p>
        </div>

        <ContactTable
          activeTab="all"
          contacts={contacts}
          isLoading={isLoading}
          error={error}
          onClientClick={onClientClick}
          onSelectionChange={onSelectionChange}
          onUpdateServicesClick={onUpdateServicesClick}
          onClientRowClick={onClientRowClick}
        />
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Activity className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Data Overview</p>
            <p>
              This report shows all client interactions across all service categories. Use the filters above to narrow
              down by specific services, providers, or time periods. Active clients are those who have had at least one
              interaction during the selected period.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
