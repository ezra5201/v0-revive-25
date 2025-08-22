"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ContactTable } from "@/components/contact-table"
import { QuickCheckinDialog } from "@/components/quick-checkin-dialog"
import { NewProspectDialog } from "@/components/new-prospect-dialog"
import { ChangeDateDialog } from "@/components/change-date-dialog"
import { UpdateServicesDialog } from "@/components/update-services-dialog"
import { ClientMasterRecord } from "@/components/client-master-record"
import { Header } from "@/components/header"
import { ActionBar } from "@/components/action-bar"
import { DatabaseSetup } from "@/components/database-setup"
import { useCMContacts } from "@/hooks/use-cm-contacts"
import { useDatabase } from "@/hooks/use-database"

type MainTab = "client"
type ClientSection = "cm-goals"

export default function CmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<MainTab>("client")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [activeClientSection, setActiveClientSection] = useState<ClientSection>("cm-goals")

  // Existing state (PRESERVED)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewProspectDialogOpen, setIsNewProspectDialogOpen] = useState(false)
  const [isChangeDateDialogOpen, setIsChangeDateDialogOpen] = useState(false)
  const [isUpdateServicesDialogOpen, setIsUpdateServicesDialogOpen] = useState(false)
  const [selectedContactForUpdate, setSelectedContactForUpdate] = useState<any>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [filters, setFilters] = useState<{ categories: string[]; providers: string[] }>({
    categories: [],
    providers: [],
  })
  const [prefilledProspectName, setPrefilledProspectName] = useState("")

  useEffect(() => {
    const tab = searchParams.get("tab")
    const name = searchParams.get("name")
    const section = searchParams.get("section")

    if (tab === "client" && name) {
      setActiveTab("client")
      setSelectedClient(name)
      setActiveClientSection("cm-goals")
    } else {
      // Default to first available client or show empty state
      setActiveTab("client")
      setSelectedClient(null)
      setActiveClientSection("cm-goals")
    }
  }, [searchParams, router])

  // Custom hooks for data management - using CM-specific hook
  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabase()
  const {
    contacts,
    filterData,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useCMContacts(activeTab === "client" ? "all" : activeTab, filters)

  const updateURL = useCallback(
    (tab: MainTab, clientName?: string, section?: ClientSection) => {
      const params = new URLSearchParams()

      if (clientName) {
        params.set("tab", "client")
        params.set("name", clientName)
        params.set("section", "cm-goals")
      }

      const newURL = `/cm?${params.toString()}`
      router.replace(newURL)
    },
    [router],
  )

  const handleClientRowClick = useCallback(
    (clientName: string) => {
      setActiveTab("client")
      setSelectedClient(clientName)
      setActiveClientSection("cm-goals")
      updateURL("client", clientName, "cm-goals")
    },
    [updateURL],
  )

  // Existing handlers
  const handleClientClick = useCallback((clientName: string, isToday?: boolean) => {
    if (isToday) {
      setSelectedClient(clientName)
      setIsDialogOpen(true)
    }
  }, [])

  const handleClientSearch = useCallback((clientName: string) => {
    setSelectedClient(clientName)
    setIsDialogOpen(true)
  }, [])

  const handleNewProspectClick = useCallback((searchedName?: string) => {
    setPrefilledProspectName(searchedName || "")
    setIsNewProspectDialogOpen(true)
  }, [])

  const handleSelectionChange = useCallback((count: number, selectedIds: number[]) => {
    setSelectedCount(count)
    setSelectedContactIds(selectedIds)
  }, [])

  const handleDataUpdate = useCallback(() => {
    refetchContacts()
    setSelectedCount(0)
    setSelectedContactIds([])
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

  // Show database setup if not initialized
  if (!isInitialized && !dbLoading) {
    return <DatabaseSetup />
  }

  // Show loading state
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
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button className="py-4 px-1 border-b-2 font-medium text-sm border-orange-500 text-orange-600">
              CM Check-Ins
            </button>
            <button className="py-4 px-1 border-b-2 font-medium text-sm border-orange-500 text-orange-600">
              CM Goals
            </button>
          </nav>
        </div>
      </div>

      <main>
        {selectedClient ? (
          <ClientMasterRecord
            clientName={selectedClient}
            activeSection="cm-goals"
            onSectionChange={() => {}} // No section changes needed
            context="cm"
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Select a client to view CM check-ins and goals</p>
          </div>
        )}
      </main>

      {/* Conditional Content Rendering */}
      {activeTab !== "client" && (
        <>
          <ActionBar
            activeTab={activeTab}
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
          />

          <main className="bg-white">
            <ContactTable
              activeTab={activeTab}
              contacts={contacts}
              isLoading={contactsLoading}
              error={contactsError}
              onClientClick={handleClientClick}
              onSelectionChange={handleSelectionChange}
              onUpdateServicesClick={handleUpdateServicesClick}
              onClientRowClick={handleClientRowClick}
            />
          </main>
        </>
      )}

      {/* All existing dialogs */}
      <QuickCheckinDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        clientName={selectedClient || ""}
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
          // Handle date change logic
          handleDataUpdate()
        }}
      />

      <UpdateServicesDialog
        isOpen={isUpdateServicesDialogOpen}
        onClose={handleCloseUpdateServicesDialog}
        contactData={selectedContactForUpdate}
        onServicesUpdate={handleServicesUpdated}
        isFromCMTab={true}
      />
    </div>
  )
}
