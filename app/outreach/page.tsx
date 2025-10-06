"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { ClientDrawer } from "@/components/client-drawer"
import { useDatabase } from "@/hooks/use-database"
import { OutreachLocations } from "@/components/outreach-locations"
import { OutreachRuns } from "@/components/outreach-runs"
import { OutreachContacts } from "@/components/outreach-contacts"
import { OutreachInventory } from "@/components/outreach-inventory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Package, Users } from "lucide-react"

export default function OutreachPage() {
  // Use the same database initialization logic as Contact Log
  const { isInitialized, isLoading: dbLoading } = useDatabase()
  const [activeTab, setActiveTab] = useState("runs")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerClientName, setDrawerClientName] = useState<string | null>(null)

  const handleClientSelect = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
  }, [])

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
      <Header onClientSelect={handleClientSelect} />

      <main className="bg-white">
        <div className="px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Outreach Management</h1>
              <p className="text-gray-600">Manage street outreach operations, locations, runs, and client contacts</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="runs" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Runs</span>
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Contacts</span>
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Locations</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="runs">
                <OutreachRuns />
              </TabsContent>

              <TabsContent value="inventory">
                <OutreachInventory />
              </TabsContent>

              <TabsContent value="contacts">
                <OutreachContacts />
              </TabsContent>

              <TabsContent value="locations">
                <OutreachLocations />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <ClientDrawer isOpen={isDrawerOpen} clientName={drawerClientName} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}
