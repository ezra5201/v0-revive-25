"use client"

import { useState, useCallback, useEffect } from "react"
import { ContactTable } from "@/components/contact-table"
import { QuickCheckinDialog } from "@/components/quick-checkin-dialog"
import { NewProspectDialog } from "@/components/new-prospect-dialog"
import { ChangeDateDialog } from "@/components/change-date-dialog"
import { UpdateServicesDialog } from "@/components/update-services-dialog"
import { Header } from "@/components/header"
import { ActionBar } from "@/components/action-bar"
import { DatabaseSetup } from "@/components/database-setup"
import { useContacts } from "@/hooks/use-contacts"
import { useDatabase } from "@/hooks/use-database"
import { useRouter } from "next/navigation"

type ActiveTab = "today" | "all"

export default function ContactLogPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/contact-log")
  }, [router])

  const [activeTab, setActiveTab] = useState<ActiveTab>("today")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
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

  const { isInitialized, isLoading: dbLoading } = useDatabase()
  const {
    contacts,
    filterData,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useContacts(activeTab, filters)

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

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab)
    setSelectedCount(0)
    setSelectedContactIds([])
    setFilters({ categories: [], providers: [] })
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
              onClick={() => handleTabChange("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Clients
            </button>
          </nav>
        </div>
      </div>

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
        />
      </main>

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
        onClose={() => setIsUpdateServicesDialogOpen(false)}
        contactData={selectedContactForUpdate}
        onServicesUpdate={handleDataUpdate}
      />
    </div>
  )
}
