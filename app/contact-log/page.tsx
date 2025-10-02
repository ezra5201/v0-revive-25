"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
import { useCMContacts } from "@/hooks/use-cm-contacts"
import { useOTContacts } from "@/hooks/use-ot-contacts"
import { useContacts } from "@/hooks/use-contacts"
import { useDatabase } from "@/hooks/use-database"

type MainTab = "today" | "cm" | "ot"

export default function ContactLogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<MainTab>("today")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerClientName, setDrawerClientName] = useState<string | null>(null)

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

  useEffect(() => {
    const tab = searchParams.get("tab")

    if (tab === "cm") {
      setActiveTab("cm")
      setFilters({ categories: [], providers: ["Andrea Leflore"] })
    } else if (tab === "ot") {
      setActiveTab("ot")
      setFilters({ categories: [], providers: [] })
    } else if (tab === "today") {
      setActiveTab("today")
    } else {
      router.replace("/contact-log?tab=today")
      setActiveTab("today")
    }
  }, [searchParams, router])

  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabase()

  const {
    contacts: cmContacts,
    filterData: cmFilterData,
    isLoading: cmLoading,
    error: cmError,
    refetch: refetchCM,
  } = useCMContacts(activeTab === "cm" ? "all" : "today", filters)

  const {
    contacts: otContacts,
    filterData: otFilterData,
    loading: otLoading,
    error: otError,
    refetch: refetchOT,
  } = useOTContacts(activeTab === "ot" ? "all" : "today", filters.categories, filters.providers)

  const {
    contacts: todayContacts,
    filterData: todayFilterData,
    isLoading: todayLoading,
    error: todayError,
    refetch: refetchToday,
  } = useContacts("today", filters)

  const contacts = activeTab === "cm" ? cmContacts : activeTab === "ot" ? otContacts : todayContacts
  const filterData = activeTab === "cm" ? cmFilterData : activeTab === "ot" ? otFilterData : todayFilterData
  const contactsLoading = activeTab === "cm" ? cmLoading : activeTab === "ot" ? otLoading : todayLoading
  const contactsError = activeTab === "cm" ? cmError : activeTab === "ot" ? otError : todayError
  const refetchContacts = activeTab === "cm" ? refetchCM : activeTab === "ot" ? refetchOT : refetchToday

  const updateURL = useCallback(
    (tab: MainTab) => {
      const params = new URLSearchParams()

      if (tab === "cm") {
        params.set("tab", "cm")
      } else if (tab === "ot") {
        params.set("tab", "ot")
      } else if (tab === "today") {
        params.set("tab", "today")
      }

      const newURL = `/contact-log?${params.toString()}`
      router.replace(newURL)
    },
    [router],
  )

  const handleClientRowClick = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
  }, [])

  const handleTabChange = useCallback(
    (tab: MainTab) => {
      setActiveTab(tab)
      setSelectedCount(0)
      setSelectedContactIds([])

      if (tab === "cm") {
        setFilters({ categories: [], providers: ["Andrea Leflore"] })
      } else if (tab === "ot") {
        setFilters({ categories: [], providers: [] })
      } else {
        setFilters({ categories: [], providers: [] })
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

      {/* Search Bar */}
      <GlobalSearch onClientSelect={handleClientSearch} clients={filterData.clients} />

      {/* Context Bar with Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("today")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "today"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Today's Check-ins
            </button>
            <button
              onClick={() => handleTabChange("cm")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "cm"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              CM Caseload
            </button>
            <button
              onClick={() => handleTabChange("ot")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "ot"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              OT Caseload
            </button>
          </nav>
        </div>
      </div>

      <ActionBar
        activeTab={activeTab === "cm" || activeTab === "ot" ? "all" : activeTab}
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
        hasData={contacts.length > 0}
      />

      <main className="bg-white">
        <ContactTable
          activeTab={activeTab === "cm" || activeTab === "ot" ? "all" : activeTab}
          contacts={contacts}
          isLoading={contactsLoading}
          error={contactsError}
          onClientClick={handleClientClick}
          onSelectionChange={handleSelectionChange}
          onUpdateServicesClick={handleUpdateServicesClick}
          onClientRowClick={handleClientRowClick}
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
        isFromCMTab={activeTab === "cm"}
        isFromOTTab={activeTab === "ot"}
      />
    </div>
  )
}
