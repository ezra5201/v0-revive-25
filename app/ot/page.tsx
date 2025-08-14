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
import { useOTContacts } from "@/hooks/use-ot-contacts"
import { useDatabase } from "@/hooks/use-database"
import { X } from "lucide-react"

type MainTab = "today" | "all" | "client"
type ClientSection = "basic-info" | "contact-history" | "journey-timeline" | "ot-goals"

export default function OtPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Enhanced state management
  const [activeTab, setActiveTab] = useState<MainTab>("today")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [activeClientSection, setActiveClientSection] = useState<ClientSection>("basic-info")

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

  // Initialize state from URL parameters
  useEffect(() => {
    const tab = searchParams.get("tab")
    const name = searchParams.get("name")
    const section = searchParams.get("section")

    if (tab === "client" && name) {
      setActiveTab("client")
      setSelectedClient(name)
      setActiveClientSection((section as ClientSection) || "basic-info")
    } else if (tab === "all") {
      setActiveTab("all")
    } else {
      setActiveTab("today")
    }
  }, [searchParams])

  // Custom hooks for data management - using OT-specific hook
  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabase()
  const {
    contacts,
    filterData,
    loading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useOTContacts(activeTab === "client" ? "all" : activeTab, filters.categories, filters.providers)

  // URL update helper
  const updateURL = useCallback(
    (tab: MainTab, clientName?: string, section?: ClientSection) => {
      const params = new URLSearchParams()

      if (tab === "client" && clientName) {
        params.set("tab", "client")
        params.set("name", clientName)
        params.set("section", section || "basic-info")
      } else if (tab === "all") {
        params.set("tab", "all")
      }
      // For 'today' tab, we don't set any params (default state)

      const newURL = params.toString() ? `/ot?${params.toString()}` : "/ot"
      router.replace(newURL)
    },
    [router],
  )

  // Client row click handler for "All Clients" tab
  const handleClientRowClick = useCallback(
    (clientName: string) => {
      setActiveTab("client")
      setSelectedClient(clientName)
      setActiveClientSection("basic-info")
      updateURL("client", clientName, "basic-info")
    },
    [updateURL],
  )

  // Close client tab handler
  const handleCloseClientTab = useCallback(() => {
    setActiveTab("all")
    setSelectedClient(null)
    setActiveClientSection("basic-info")
    updateURL("all")
  }, [updateURL])

  // Client section change handler
  const handleClientSectionChange = useCallback(
    (section: "basic-info" | "contact-history" | "journey-timeline" | "ot-goals") => {
      setActiveClientSection(section)
      if (selectedClient) {
        updateURL("client", selectedClient, section)
      }
    },
    [selectedClient, updateURL],
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

  const handleTabChange = useCallback(
    (tab: MainTab) => {
      setActiveTab(tab)
      setSelectedCount(0)
      setSelectedContactIds([])
      setFilters({ categories: [], providers: [] })

      if (tab !== "client") {
        setSelectedClient(null)
        setActiveClientSection("basic-info")
      }

      updateURL(tab)
    },
    [updateURL],
  )

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

      {/* Enhanced Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {/* OT-specific tabs */}
            <button
              onClick={() => handleTabChange("today")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "today"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Today's OT Check-ins
            </button>
            <button
              onClick={() => handleTabChange("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All OT Clients
            </button>

            {/* Dynamic client tab */}
            {selectedClient && (
              <button
                onClick={() => handleTabChange("client")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "client"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{selectedClient}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseClientTab()
                  }}
                  className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Close client tab"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            )}
          </nav>
        </div>
      </div>

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

      {/* Client Master Record */}
      {activeTab === "client" && selectedClient && (
        <main>
          <ClientMasterRecord
            clientName={selectedClient}
            activeSection={activeClientSection}
            onSectionChange={handleClientSectionChange}
          />
        </main>
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
        isFromOTTab={true}
      />
    </div>
  )
}
