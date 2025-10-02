"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { QuickCheckinDialog } from "@/components/quick-checkin-dialog"
import { NewProspectDialog } from "@/components/new-prospect-dialog"
import { ChangeDateDialog } from "@/components/change-date-dialog"
import { UpdateServicesDialog } from "@/components/update-services-dialog"
import { ClientDrawer } from "@/components/client-drawer"
import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { useContacts } from "@/hooks/use-contacts"
import { useDatabase } from "@/hooks/use-database"
import { IDHSQuarterlyReport } from "@/components/idhs-quarterly-report"
import { AllClientsReport } from "@/components/all-clients-report"

type MainTab = "all-clients" | "idhs-quarterly"

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<MainTab>("all-clients")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewProspectDialogOpen, setIsNewProspectDialogOpen] = useState(false)
  const [isChangeDateDialogOpen, setIsChangeDateDialogOpen] = useState(false)
  const [isUpdateServicesDialogOpen, setIsUpdateServicesDialogOpen] = useState(false)
  const [selectedContactForUpdate, setSelectedContactForUpdate] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [filters, setFilters] = useState<{ categories: string[]; providers: string[] }>({
    categories: [],
    providers: [],
  })
  const [prefilledProspectName, setPrefilledProspectName] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerClientName, setDrawerClientName] = useState<string | null>(null)

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

    if (tab === "all-clients") {
      setActiveTab("all-clients")
    } else if (tab === "idhs-quarterly") {
      setActiveTab("idhs-quarterly")
    } else {
      // Default to all-clients tab
      router.replace("/reports?tab=all-clients")
      setActiveTab("all-clients")
    }
  }, [searchParams, router])

  const handleClientRowClick = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
  }, [])

  const handleClientClick = useCallback((clientName: string, isToday?: boolean) => {
    setSelectedClient(clientName)
    setIsDialogOpen(true)
  }, [])

  const handleClientSearch = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
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
      <Header onClientSelect={handleClientSearch} />

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => {
                setActiveTab("all-clients")
                router.push("/reports?tab=all-clients")
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all-clients"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Clients
            </button>
            <button
              onClick={() => {
                setActiveTab("idhs-quarterly")
                router.push("/reports?tab=idhs-quarterly")
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "idhs-quarterly"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              IDHS Quarterly
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "all-clients" && (
        <main className="bg-white">
          <AllClientsReport
            contacts={contacts}
            filterData={filterData}
            isLoading={contactsLoading}
            error={contactsError}
            selectedCount={selectedCount}
            selectedContactIds={selectedContactIds}
            onClientClick={handleClientClick}
            onSelectionChange={handleSelectionChange}
            onUpdateServicesClick={handleUpdateServicesClick}
            onClientRowClick={handleClientRowClick}
            onClientSelect={handleClientSearch}
            onNewProspect={handleNewProspectClick}
            onFiltersChange={setFilters}
            onServiceCompleted={handleDataUpdate}
            onDateChangeClick={() => setIsChangeDateDialogOpen(true)}
          />
        </main>
      )}

      {activeTab === "idhs-quarterly" && (
        <main className="bg-white">
          <IDHSQuarterlyReport />
        </main>
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

      <ClientDrawer isOpen={isDrawerOpen} clientName={drawerClientName} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}
