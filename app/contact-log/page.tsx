"use client"

import { useState, useCallback } from "react"
import { ContactTable } from "@/components/contact-table"
import { QuickCheckinDialog } from "@/components/quick-checkin-dialog"
import { NewProspectDialog } from "@/components/new-prospect-dialog"
import { ChangeDateDialog } from "@/components/change-date-dialog"
import { UpdateServicesDialog } from "@/components/update-services-dialog"
import { ClientDrawer } from "@/components/client-drawer"
import { Header } from "@/components/header"
import { ActionBar } from "@/components/action-bar"
import { DatabaseSetup } from "@/components/database-setup"
import { GlobalSearch } from "@/components/global-search"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useContacts } from "@/hooks/use-contacts"
import { useDatabase } from "@/hooks/use-database"

type ViewFilter = "all" | "today" | "cm" | "ot"

export default function ContactLogPage() {
  const [viewFilter, setViewFilter] = useState<ViewFilter>("today")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerClientName, setDrawerClientName] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewProspectDialogOpen, setIsNewProspectDialogOpen] = useState(false)
  const [isChangeDateDialogOpen, setIsChangeDateDialogOpen] = useState(false)
  const [isUpdateServicesDialogOpen, setIsUpdateServicesDialogOpen] = useState(false)
  const [selectedContactForUpdate, setSelectedContactForUpdate] = useState<any>(null)
  const [isBulkUpdateServicesDialogOpen, setIsBulkUpdateServicesDialogOpen] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [filters, setFilters] = useState<{ categories: string[]; providers: string[] }>({
    categories: [],
    providers: [],
  })
  const [prefilledProspectName, setPrefilledProspectName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearchResults, setHasSearchResults] = useState(false)
  const [servicesVariant, setServicesVariant] = useState<"default" | "badges" | "dots" | "cards" | "progress">("badges")

  const handleClientSearch = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
  }, [])

  const handleNewProspectClick = useCallback(() => {
    setIsNewProspectDialogOpen(true)
  }, [])

  const handleClientClick = useCallback((clientId: number) => {
    // Implement client click logic here
  }, [])

  const handleNewProspectFromSearch = useCallback(() => {
    setPrefilledProspectName(searchQuery)
    setIsNewProspectDialogOpen(true)
  }, [searchQuery])

  const handleSearchChange = useCallback((query: string, hasResults: boolean) => {
    setSearchQuery(query)
    setHasSearchResults(hasResults)
  }, [])

  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabase()

  const {
    contacts,
    filterData,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useContacts(viewFilter, filters)

  const handleClientRowClick = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
  }, [])

  const handleViewFilterChange = useCallback((newView: ViewFilter) => {
    setViewFilter(newView)
    setSelectedCount(0)
    setSelectedContactIds([])

    if (newView === "cm") {
      setFilters({ categories: [], providers: ["Andrea Leflore"] })
    } else {
      setFilters({ categories: [], providers: [] })
    }
  }, [])

  const handleSelectionChange = useCallback((count: number, selectedIds: number[]) => {
    setSelectedCount(count)
    setSelectedContactIds(selectedIds)
  }, [])

  const handleDataUpdate = useCallback(() => {
    setTimeout(() => {
      refetchContacts()
      setSelectedCount(0)
      setSelectedContactIds([])
    }, 500)
  }, [refetchContacts])

  const handleUpdateServicesClick = useCallback((contact: any) => {
    setSelectedContactForUpdate(contact)
    setIsUpdateServicesDialogOpen(true)
  }, [])

  const handleCloseUpdateServicesDialog = useCallback(() => {
    setIsUpdateServicesDialogOpen(false)
    setSelectedContactForUpdate(null)
  }, [])

  const handleServicesUpdated = useCallback(() => {
    refetchContacts()
    setIsUpdateServicesDialogOpen(false)
    setSelectedContactForUpdate(null)
  }, [refetchContacts])

  const handleBulkUpdateServicesClick = useCallback(() => {
    setIsBulkUpdateServicesDialogOpen(true)
  }, [])

  const handleCloseBulkUpdateServicesDialog = useCallback(() => {
    setIsBulkUpdateServicesDialogOpen(false)
  }, [])

  const handleBulkServicesUpdated = useCallback(() => {
    refetchContacts()
    setIsBulkUpdateServicesDialogOpen(false)
    setSelectedCount(0)
    setSelectedContactIds([])
  }, [refetchContacts])

  if (!isInitialized && !dbLoading) {
    return <DatabaseSetup />
  }

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onClientSelect={handleClientSearch} />

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <GlobalSearch
            onClientSelect={handleClientSearch}
            onSearchChange={handleSearchChange}
            clients={filterData.clients}
          />
          {searchQuery.trim() !== "" && !hasSearchResults && (
            <Button
              onClick={handleNewProspectFromSearch}
              variant="outline"
              className="flex items-center gap-2 shrink-0 bg-transparent"
            >
              <UserPlus className="h-4 w-4" />
              New Prospect
            </Button>
          )}
        </div>
      </div>

      <ActionBar
        viewFilter={viewFilter}
        onViewFilterChange={handleViewFilterChange}
        selectedCount={selectedCount}
        selectedContactIds={selectedContactIds}
        onExport={() => console.log("Export")}
        clients={filterData.clients}
        onClientSelect={handleClientSearch}
        onNewProspect={handleNewProspectClick}
        providers={filterData.providers}
        categories={filterData.categories}
        onFiltersChange={setFilters}
        onServiceCompleted={handleDataUpdate}
        onDateChangeClick={() => setIsChangeDateDialogOpen(true)}
        onBulkUpdateServicesClick={handleBulkUpdateServicesClick}
        hasData={contacts.length > 0}
        servicesVariant={servicesVariant}
        onServicesVariantChange={setServicesVariant}
      />

      <main className="bg-white">
        <ContactTable
          contacts={contacts}
          isLoading={contactsLoading}
          error={contactsError}
          onClientClick={handleClientClick}
          onSelectionChange={handleSelectionChange}
          onUpdateServicesClick={handleUpdateServicesClick}
          onClientRowClick={handleClientRowClick}
          showServices={viewFilter === "today"}
          servicesVariant={servicesVariant}
        />
      </main>

      <ClientDrawer isOpen={isDrawerOpen} clientName={drawerClientName} onClose={() => setIsDrawerOpen(false)} />

      <QuickCheckinDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        clientName={drawerClientName || ""}
        onCheckInSubmit={handleDataUpdate}
      />

      <NewProspectDialog
        isOpen={isNewProspectDialogOpen}
        onClose={() => setIsNewProspectDialogOpen(false)}
        onCheckInSubmit={handleDataUpdate}
        prefilledName={prefilledProspectName}
        existingClients={filterData.clients}
      />

      <ChangeDateDialog
        isOpen={isChangeDateDialogOpen}
        onClose={() => setIsChangeDateDialogOpen(false)}
        selectedCount={selectedCount}
        onDateChange={async (newDate: string) => {
          handleDataUpdate()
        }}
      />

      <UpdateServicesDialog
        isOpen={isUpdateServicesDialogOpen}
        onClose={handleCloseUpdateServicesDialog}
        contactData={selectedContactForUpdate}
        onServicesUpdate={handleServicesUpdated}
        isFromCMTab={viewFilter === "cm"}
        isFromOTTab={viewFilter === "ot"}
      />

      <UpdateServicesDialog
        isOpen={isBulkUpdateServicesDialogOpen}
        onClose={handleCloseBulkUpdateServicesDialog}
        bulkMode={true}
        selectedContactIds={selectedContactIds}
        selectedCount={selectedCount}
        onServicesUpdate={handleBulkServicesUpdated}
      />
    </div>
  )
}
