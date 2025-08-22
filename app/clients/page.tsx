"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ClientListView } from "@/components/client-list-view"
import { QuickCheckinDialog } from "@/components/quick-checkin-dialog"
import { NewProspectDialog } from "@/components/new-prospect-dialog"
import { ChangeDateDialog } from "@/components/change-date-dialog"
import { UpdateServicesDialog } from "@/components/update-services-dialog"
import { ClientMasterRecord } from "@/components/client-master-record"
import { ClientVisualizationView } from "@/components/client-visualization-view"
import { Header } from "@/components/header"
import { ActionBar } from "@/components/action-bar"
import { DatabaseSetup } from "@/components/database-setup"
import { useContacts } from "@/hooks/use-contacts"
import { useDatabase } from "@/hooks/use-database"
import { X } from "lucide-react"

type MainTab = "all" | "client"
type ClientSection = "basic-info" | "contact-history" | "journey-timeline" | "cm-goals" | "ot-checkins"
type ViewMode = "list" | "visual"

export default function ClientsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<MainTab>("all")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [activeClientSection, setActiveClientSection] = useState<ClientSection>("basic-info")
  const [currentView, setCurrentView] = useState<ViewMode>("list")
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

  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabase()
  const {
    contacts,
    filterData,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useContacts("all", filters)

  useEffect(() => {
    const tab = searchParams.get("tab")
    const name = searchParams.get("name")
    const section = searchParams.get("section")
    const view = searchParams.get("view")

    if (tab === "client" && name) {
      setActiveTab("client")
      setSelectedClient(name)
      setActiveClientSection((section as ClientSection) || "basic-info")
      setCurrentView((view as ViewMode) || "list")
    } else if (tab === "all") {
      setActiveTab("all")
    } else {
      router.replace("/clients?tab=all")
      setActiveTab("all")
    }
  }, [searchParams, router])

  const updateURL = useCallback(
    (tab: MainTab, clientName?: string, section?: ClientSection, view?: ViewMode) => {
      const params = new URLSearchParams()

      if (tab === "client" && clientName) {
        params.set("tab", "client")
        params.set("name", clientName)
        params.set("section", section || "basic-info")
        params.set("view", view || "list")
      } else if (tab === "all") {
        params.set("tab", "all")
      }

      const newURL = `/clients?${params.toString()}`
      router.replace(newURL)
    },
    [router],
  )

  const handleClientRowClick = useCallback(
    (clientName: string) => {
      setActiveTab("client")
      setSelectedClient(clientName)
      setActiveClientSection("basic-info")
      setCurrentView("list")
      updateURL("client", clientName, "basic-info", "list")
    },
    [updateURL],
  )

  const handleCloseClientTab = useCallback(() => {
    setActiveTab("all")
    setSelectedClient(null)
    setActiveClientSection("basic-info")
    setCurrentView("list")
    updateURL("all")
  }, [updateURL])

  const handleClientSectionChange = useCallback(
    (section: ClientSection) => {
      setActiveClientSection(section)
      if (selectedClient) {
        updateURL("client", selectedClient, section, currentView)
      }
    },
    [selectedClient, currentView, updateURL],
  )

  const handleViewChange = useCallback(
    (view: ViewMode) => {
      setCurrentView(view)
      if (selectedClient) {
        updateURL("client", selectedClient, activeClientSection, view)
      }
    },
    [selectedClient, activeClientSection, updateURL],
  )

  const handleTabChange = useCallback(
    (tab: MainTab) => {
      if (tab === "all") {
        setActiveTab("all")
        setSelectedClient(null)
        setActiveClientSection("basic-info")
        setCurrentView("list")
        setSelectedCount(0)
        setSelectedContactIds([])
        setFilters({ categories: [], providers: [] })
        updateURL("all")
      } else if (tab === "client" && selectedClient) {
        setActiveTab("client")
        updateURL(tab, selectedClient, activeClientSection, currentView)
      }
    },
    [updateURL, selectedClient, activeClientSection, currentView],
  )

  const handleClientClick = useCallback((clientName: string, isToday?: boolean) => {
    setSelectedClient(clientName)
    setIsDialogOpen(true)
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
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Clients
            </button>

            {selectedClient && activeTab === "client" && (
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

      {activeTab === "all" && (
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
            <ClientListView
              contacts={contacts}
              isLoading={contactsLoading}
              error={contactsError}
              onClientClick={handleClientRowClick}
            />
          </main>
        </>
      )}

      {activeTab === "client" && selectedClient && (
        <>
          <ActionBar
            activeTab={activeTab}
            selectedCount={0}
            currentView={currentView}
            onViewChange={handleViewChange}
          />

          <main>
            {currentView === "list" ? (
              <ClientMasterRecord
                clientName={selectedClient}
                activeSection={activeClientSection}
                onSectionChange={handleClientSectionChange}
                context="clients"
              />
            ) : (
              <ClientVisualizationView clientName={selectedClient} activeSection={activeClientSection} />
            )}
          </main>
        </>
      )}

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
          handleDataUpdate()
        }}
      />

      <UpdateServicesDialog
        isOpen={isUpdateServicesDialogOpen}
        onClose={handleCloseUpdateServicesDialog}
        contactData={selectedContactForUpdate}
        onServicesUpdate={handleServicesUpdated}
      />
    </div>
  )
}
