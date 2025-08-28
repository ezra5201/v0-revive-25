"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ContactTable } from "@/components/contact-table"
import { QuickCheckinDialog } from "@/components/quick-checkin-dialog"
import { NewProspectDialog } from "@/components/new-prospect-dialog"
import { ChangeDateDialog } from "@/components/change-date-dialog"
import { UpdateServicesDialog } from "@/components/update-services-dialog"
import { ClientVisualizationView } from "@/components/client-visualization-view"
import { Header } from "@/components/header"
import { ActionBar } from "@/components/action-bar"
import { DatabaseSetup } from "@/components/database-setup"
import { useContacts } from "@/hooks/use-contacts"
import { useDatabase } from "@/hooks/use-database"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { X, ChevronRight, ExternalLink, List, Grid3X3 } from "lucide-react"

type MainTab = "today" | "client"
type ClientSection = "basic-info" | "contact-history" | "journey-timeline" | "cm-goals" | "ot-checkins"
type ViewMode = "list" | "visual"

export default function ContactLogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<MainTab>("today")
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
    } else if (tab === "today") {
      setActiveTab("today")
    } else {
      router.replace("/contact-log?tab=today")
      setActiveTab("today")
    }
  }, [searchParams, router])

  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabase()
  const {
    contacts,
    filterData,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useContacts(activeTab === "client" ? "all" : activeTab, filters)

  const updateURL = useCallback(
    (tab: MainTab, clientName?: string, section?: ClientSection, view?: ViewMode) => {
      const params = new URLSearchParams()

      if (tab === "client" && clientName) {
        params.set("tab", "client")
        params.set("name", clientName)
        params.set("section", section || "basic-info")
        params.set("view", view || "list")
      } else if (tab === "today") {
        params.set("tab", "today")
      }

      const newURL = `/contact-log?${params.toString()}`
      router.replace(newURL)
    },
    [router],
  )

  const handleClientRowClick = useCallback(
    (clientName: string) => {
      router.push(`/clients?tab=client&name=${encodeURIComponent(clientName)}&section=basic-info`)
    },
    [router],
  )

  const handleCloseClientTab = useCallback(() => {
    setActiveTab("today")
    setSelectedClient(null)
    setActiveClientSection("basic-info")
    setCurrentView("list")
    updateURL("today")
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
        setCurrentView("list")
      }

      if (tab === "client" && selectedClient) {
        updateURL(tab, selectedClient, activeClientSection, currentView)
      } else {
        updateURL(tab)
      }
    },
    [updateURL, selectedClient, activeClientSection, currentView],
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

      {activeTab === "client" && selectedClient && (
        <>
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-semibold text-gray-900">{selectedClient}</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Client
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={currentView === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChange("list")}
                  className="flex items-center space-x-1"
                >
                  <List className="h-4 w-4" />
                  <span>List View</span>
                </Button>
                <Button
                  variant={currentView === "visual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChange("visual")}
                  className="flex items-center space-x-1"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>Visual View</span>
                </Button>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentView === "list" ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-base text-gray-900">{selectedClient}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Category</label>
                            <div className="mt-1">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Client
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <div className="mt-1">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">First Added</label>
                            <p className="text-base text-gray-900">March 9, 2022</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Last Updated</label>
                            <p className="text-base text-gray-900">March 16, 2022</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Total Contacts</label>
                            <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                              2
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-900">Contact History (2)</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-gray-600">Contact history details would be displayed here...</p>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-900">CM Check-ins (2)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in CM
                        </Button>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-gray-600">CM check-in details would be displayed here...</p>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-500">CM Goals (0)</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-gray-600">No CM goals found.</p>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-900">OT Check-ins (2)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in OT
                        </Button>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-gray-600">OT check-in details would be displayed here...</p>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-500">OT Goals (0)</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-gray-600">No OT goals found.</p>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
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
