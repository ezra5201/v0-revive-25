"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClientBasicInfo } from "./client-basic-info"
import { ClientContactHistory } from "./client-contact-history"
import { ClientJourneyTimeline } from "./client-journey-timeline"
import { ClientOTCheckins } from "./client-ot-checkins"
import { GoalWidget } from "./goal-widget"
import { OTGoalWidget } from "./ot-goal-widget"
import { QuickCheckinDialog } from "./quick-checkin-dialog"
import { CMCheckinModal } from "./cm-checkin-modal"
import { OTCheckinModal } from "./ot-checkin-modal"
import { User, ChevronDown, ChevronRight, List, BarChart3, Plus, Edit } from "lucide-react"

interface ClientMasterRecordProps {
  clientName: string
  activeSection:
    | "basic-info"
    | "contact-history"
    | "journey-timeline"
    | "cm-goals"
    | "ot-goals"
    | "ot-checkins"
    | "full-profile"
  onSectionChange: (
    section:
      | "basic-info"
      | "contact-history"
      | "journey-timeline"
      | "cm-goals"
      | "ot-goals"
      | "ot-checkins"
      | "full-profile",
  ) => void
  context: "cm" | "ot" | "clients"
  currentView?: "list" | "visual"
  onViewChange?: (view: "list" | "visual") => void
  showContentOnly?: boolean // Add prop to control whether to show only header or full content
}

interface ClientData {
  name: string
  category: string
  active: boolean
  created_at: string
  updated_at: string
}

interface ContactRecord {
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

export function ClientMasterRecord({
  clientName,
  activeSection,
  onSectionChange,
  context,
  currentView = "list",
  onViewChange,
  showContentOnly = false, // Add showContentOnly prop with default false
}: ClientMasterRecordProps) {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [contactHistory, setContactHistory] = useState<ContactRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionCounts, setSectionCounts] = useState({
    contactHistory: 0,
    cmCheckins: 0,
    cmGoals: 0,
    otCheckins: 0,
    otGoals: 0,
  })
  const [sectionsLoading, setSectionsLoading] = useState(true)
  const router = useRouter()

  const [isQuickCheckinOpen, setIsQuickCheckinOpen] = useState(false)
  const [isCMCheckinOpen, setIsCMCheckinOpen] = useState(false)
  const [isOTCheckinOpen, setIsOTCheckinOpen] = useState(false)
  const [hasCMCheckinToday, setHasCMCheckinToday] = useState(false)
  const [hasOTCheckinToday, setHasOTCheckinToday] = useState(false)
  const [checkingCMCheckin, setCheckingCMCheckin] = useState(false)
  const [checkingOTCheckin, setCheckingOTCheckin] = useState(false)

  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const clientResponse = await fetch(`/api/clients/${encodeURIComponent(clientName)}`)
        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client data")
        }
        const client = await clientResponse.json()
        setClientData(client)

        const historyResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}`)
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch contact history")
        }
        const history = await historyResponse.json()
        console.log("=== CLIENT MASTER RECORD DEBUG ===")
        console.log("Client name:", clientName)
        console.log("History API response status:", historyResponse.status)
        console.log("History API response data:", history)
        console.log("History data type:", typeof history)
        console.log("History is array:", Array.isArray(history))
        console.log("History length:", history?.length || "N/A")
        console.log("First history item:", history?.[0] || "N/A")
        console.log("=== END DEBUG ===")
        setContactHistory(history.contacts)
      } catch (err) {
        console.error("=== CLIENT MASTER RECORD ERROR ===")
        console.error("Error fetching client data:", err)
        console.error("Client name:", clientName)
        console.error("Error details:", err instanceof Error ? err.message : err)
        console.error("=== END ERROR ===")
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientData()
  }, [clientName])

  useEffect(() => {
    const fetchSectionCounts = async () => {
      if (!clientName) return

      setSectionsLoading(true)
      try {
        const cmResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}&serviceFilter=cm`)
        const cmData = cmResponse.ok ? await cmResponse.json() : { contacts: [] }

        const otResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}&serviceFilter=ot`)
        const otData = otResponse.ok ? await otResponse.json() : { contacts: [] }

        const cmGoalsResponse = await fetch(`/api/goals/by-client/${encodeURIComponent(clientName)}`)
        const cmGoalsData = cmGoalsResponse.ok ? await cmGoalsResponse.json() : { data: [] }

        const otGoalsResponse = await fetch(`/api/ot-goals/by-client/${encodeURIComponent(clientName)}`)
        const otGoalsData = otGoalsResponse.ok ? await otGoalsResponse.json() : { data: [] }

        setSectionCounts({
          contactHistory: contactHistory.length,
          cmCheckins: cmData.contacts?.length || 0,
          cmGoals: cmGoalsData.data?.length || 0,
          otCheckins: otData.contacts?.length || 0,
          otGoals: otGoalsData.data?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching section counts:", error)
        setSectionCounts({
          contactHistory: contactHistory.length,
          cmCheckins: 0,
          cmGoals: 0,
          otCheckins: 0,
          otGoals: 0,
        })
      } finally {
        setSectionsLoading(false)
      }
    }

    fetchSectionCounts()
  }, [clientName, contactHistory.length])

  const checkForTodaysCMCheckin = async () => {
    setCheckingCMCheckin(true)
    try {
      const response = await fetch(`/api/checkins/by-client/${encodeURIComponent(clientName)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const today = new Date().toDateString()
          const todaysCheckin = result.data.find((checkin: any) => {
            const checkinDate = new Date(checkin.created_at).toDateString()
            return checkinDate === today
          })
          setHasCMCheckinToday(!!todaysCheckin)
        }
      }
    } catch (error) {
      console.error("Failed to check for today's CM check-in:", error)
    } finally {
      setCheckingCMCheckin(false)
    }
  }

  const checkForTodaysOTCheckin = async () => {
    setCheckingOTCheckin(true)
    try {
      const response = await fetch(`/api/ot-checkins/by-client/${encodeURIComponent(clientName)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const today = new Date().toDateString()
          const todaysCheckin = result.data.find((checkin: any) => {
            const checkinDate = new Date(checkin.created_at).toDateString()
            return checkinDate === today
          })
          setHasOTCheckinToday(!!todaysCheckin)
        }
      }
    } catch (error) {
      console.error("Failed to check for today's OT check-in:", error)
    } finally {
      setCheckingOTCheckin(false)
    }
  }

  useEffect(() => {
    if (clientName) {
      checkForTodaysCMCheckin()
      checkForTodaysOTCheckin()
    }
  }, [clientName])

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "prospect":
        return "bg-yellow-100 text-yellow-800"
      case "client":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTabOrder = () => {
    // Show all tabs in all contexts
    return ["basic-info", "journey-timeline", "cm-goals", "ot-checkins", "ot-goals", "contact-history", "full-profile"]
  }

  const tabConfig = {
    "basic-info": { label: "Basic Info", section: "basic-info" as const },
    "journey-timeline": { label: "CM Check-Ins", section: "journey-timeline" as const },
    "cm-goals": { label: "CM Goals", section: "cm-goals" as const },
    "ot-checkins": { label: "OT Check-Ins", section: "ot-checkins" as const },
    "ot-goals": { label: "OT Goals", section: "ot-goals" as const },
    "contact-history": { label: "Contact History", section: "contact-history" as const },
    "full-profile": { label: "Full Profile", section: "full-profile" as const },
  }

  const handleOpenInCM = () => {
    router.push(`/cm?tab=client&name=${encodeURIComponent(clientName)}&section=basic-info`)
  }

  const handleOpenInOT = () => {
    router.push(`/ot?tab=client&name=${encodeURIComponent(clientName)}&section=basic-info`)
  }

  const handleViewFullProfile = () => {
    router.push(`/clients?tab=client&name=${encodeURIComponent(clientName)}&section=basic-info`)
  }

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "basic-info": true,
    "contact-history": false,
    "cm-checkins": false,
    "cm-goals": false,
    "ot-checkins": false,
    "ot-goals": false,
  })

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  const renderSectionHeader = (title: string, count: number, isLoading = false) => {
    const displayTitle = isLoading ? title : `${title} (${count})`
    const isDisabled = !isLoading && count === 0

    return <h2 className={`text-lg font-semibold ${isDisabled ? "text-gray-400" : "text-gray-900"}`}>{displayTitle}</h2>
  }

  const handleQuickCheckinSuccess = () => {
    setIsQuickCheckinOpen(false)
    // Refresh contact history
    const fetchClientData = async () => {
      try {
        const historyResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}`)
        if (historyResponse.ok) {
          const history = await historyResponse.json()
          setContactHistory(history.contacts)
        }
      } catch (err) {
        console.error("Error refreshing contact history:", err)
      }
    }
    fetchClientData()
  }

  const handleCMCheckinSuccess = () => {
    setIsCMCheckinOpen(false)
    checkForTodaysCMCheckin()
    // Refresh contact history
    const fetchClientData = async () => {
      try {
        const historyResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}`)
        if (historyResponse.ok) {
          const history = await historyResponse.json()
          setContactHistory(history.contacts)
        }
      } catch (err) {
        console.error("Error refreshing contact history:", err)
      }
    }
    fetchClientData()
  }

  const handleOTCheckinSuccess = () => {
    setIsOTCheckinOpen(false)
    checkForTodaysOTCheckin()
    // Refresh contact history
    const fetchClientData = async () => {
      try {
        const historyResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}`)
        if (historyResponse.ok) {
          const history = await historyResponse.json()
          setContactHistory(history.contacts)
        }
      } catch (err) {
        console.error("Error refreshing contact history:", err)
      }
    }
    fetchClientData()
  }

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading client record...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <div className="h-6 w-6 text-red-600">⚠</div>
            </div>
            <p className="text-red-600 font-medium">Error loading client record</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="px-4 sm:px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
            {clientData && <Badge className={getCategoryColor(clientData.category)}>{clientData.category}</Badge>}
          </div>
          <div className="flex items-center space-x-2">
            {context === "clients" && onViewChange && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                <button
                  onClick={() => onViewChange("list")}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4 mr-1.5" />
                  List View
                </button>
                <button
                  onClick={() => onViewChange("visual")}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === "visual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Visual View
                </button>
              </div>
            )}
            {(context === "cm" || context === "ot") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFullProfile}
                className="flex items-center space-x-1 bg-transparent"
              >
                <User className="h-4 w-4" />
                <span>View Full Profile</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => setIsQuickCheckinOpen(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Check-In
          </Button>
          <Button
            onClick={() => setIsCMCheckinOpen(true)}
            disabled={checkingCMCheckin}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:bg-gray-300 disabled:shadow-none"
          >
            {checkingCMCheckin ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : hasCMCheckinToday ? (
              <Edit className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {checkingCMCheckin ? "Checking..." : hasCMCheckinToday ? "Edit CM Check-In" : "CM Check-In"}
          </Button>
          {/* Removed OT Check-In button to match simplified design */}
        </div>
      </div>

      {!showContentOnly && (
        <>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Client sections">
              {getTabOrder().map((tabKey) => {
                const tab = tabConfig[tabKey as keyof typeof tabConfig]
                return (
                  <button
                    key={tabKey}
                    onClick={() => onSectionChange(tab.section)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeSection === tab.section
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
          <div className="p-4 sm:p-6">
            {activeSection === "basic-info" && clientData && (
              <ClientBasicInfo
                clientData={clientData}
                contactHistoryLength={contactHistory.length}
                contactHistory={contactHistory}
                context={context}
              />
            )}
            {activeSection === "contact-history" && (
              <ClientContactHistory clientName={clientName} contactHistory={contactHistory} />
            )}
            {activeSection === "journey-timeline" && (
              <ClientJourneyTimeline clientName={clientName} contactHistory={contactHistory} />
            )}
            {activeSection === "cm-goals" && <GoalWidget clientName={clientName} />}
            {activeSection === "ot-goals" && <OTGoalWidget clientName={clientName} />}
            {activeSection === "ot-checkins" && (
              <ClientOTCheckins clientName={clientName} contactHistory={contactHistory} />
            )}
            {activeSection === "full-profile" && (
              <div className="space-y-6">
                {clientData && (
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection("basic-info")}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                      {expandedSections["basic-info"] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections["basic-info"] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <ClientBasicInfo
                          clientData={clientData}
                          contactHistoryLength={contactHistory.length}
                          contactHistory={contactHistory}
                          context={context}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection("contact-history")}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      sectionCounts.contactHistory === 0 && !sectionsLoading
                        ? "cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={sectionCounts.contactHistory === 0 && !sectionsLoading}
                  >
                    {renderSectionHeader("Contact History", sectionCounts.contactHistory, sectionsLoading)}
                    {(sectionCounts.contactHistory > 0 || sectionsLoading) &&
                      (expandedSections["contact-history"] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      ))}
                  </button>
                  {expandedSections["contact-history"] && sectionCounts.contactHistory > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <ClientContactHistory clientName={clientName} contactHistory={contactHistory} />
                    </div>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection("cm-checkins")}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      sectionCounts.cmCheckins === 0 && !sectionsLoading
                        ? "cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={sectionCounts.cmCheckins === 0 && !sectionsLoading}
                  >
                    {renderSectionHeader("CM Check-ins", sectionCounts.cmCheckins, sectionsLoading)}
                    {(sectionCounts.cmCheckins > 0 || sectionsLoading) &&
                      (expandedSections["cm-checkins"] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      ))}
                  </button>
                  {expandedSections["cm-checkins"] && sectionCounts.cmCheckins > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <ClientJourneyTimeline clientName={clientName} contactHistory={contactHistory} />
                    </div>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection("cm-goals")}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      sectionCounts.cmGoals === 0 && !sectionsLoading
                        ? "cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={sectionCounts.cmGoals === 0 && !sectionsLoading}
                  >
                    {renderSectionHeader("CM Goals", sectionCounts.cmGoals, sectionsLoading)}
                    {(sectionCounts.cmGoals > 0 || sectionsLoading) &&
                      (expandedSections["cm-goals"] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      ))}
                  </button>
                  {expandedSections["cm-goals"] && sectionCounts.cmGoals > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <GoalWidget clientName={clientName} />
                    </div>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection("ot-checkins")}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      sectionCounts.otCheckins === 0 && !sectionsLoading
                        ? "cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={sectionCounts.otCheckins === 0 && !sectionsLoading}
                  >
                    {renderSectionHeader("OT Check-ins", sectionCounts.otCheckins, sectionsLoading)}
                    {(sectionCounts.otCheckins > 0 || sectionsLoading) &&
                      (expandedSections["ot-checkins"] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      ))}
                  </button>
                  {expandedSections["ot-checkins"] && sectionCounts.otCheckins > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <ClientOTCheckins clientName={clientName} contactHistory={contactHistory} />
                    </div>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection("ot-goals")}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      sectionCounts.otGoals === 0 && !sectionsLoading
                        ? "cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={sectionCounts.otGoals === 0 && !sectionsLoading}
                  >
                    {renderSectionHeader("OT Goals", sectionCounts.otGoals, sectionsLoading)}
                    {(sectionCounts.otGoals > 0 || sectionsLoading) &&
                      (expandedSections["ot-goals"] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      ))}
                  </button>
                  {expandedSections["ot-goals"] && sectionCounts.otGoals > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <OTGoalWidget clientName={clientName} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <QuickCheckinDialog
        isOpen={isQuickCheckinOpen}
        onClose={() => setIsQuickCheckinOpen(false)}
        clientName={clientName}
        onCheckInSubmit={handleQuickCheckinSuccess}
      />

      <CMCheckinModal
        isOpen={isCMCheckinOpen}
        onClose={() => setIsCMCheckinOpen(false)}
        onSubmit={handleCMCheckinSuccess}
        clientName={clientName}
        contactId={0}
      />

      <OTCheckinModal
        isOpen={isOTCheckinOpen}
        onClose={() => setIsOTCheckinOpen(false)}
        onSubmit={handleOTCheckinSuccess}
        clientName={clientName}
        contactId={0}
      />
    </div>
  )
}
