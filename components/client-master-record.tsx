"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, ArrowLeft, RefreshCw } from "lucide-react"
import { ClientBasicInfo } from "./client-basic-info"
import { ClientContactHistory } from "./client-contact-history"
import { ClientJourneyTimeline } from "./client-journey-timeline"

interface Contact {
  id: number
  client_name: string
  provider_name: string
  service_type: string
  contact_date: string
  notes: string
  service_completed: boolean
  created_at: string
}

interface ClientMasterRecordProps {
  clientName: string
  onBack: () => void
}

export function ClientMasterRecord({ clientName, onBack }: ClientMasterRecordProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientData()
  }, [clientName])

  const fetchClientData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${encodeURIComponent(clientName)}`)
      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (error) {
      console.error("Failed to fetch client data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading client record...</div>
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{clientName}</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No records found</h3>
            <p className="text-muted-foreground">No contact records found for {clientName}.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate client statistics
  const firstContact = contacts.reduce((earliest, contact) =>
    new Date(contact.contact_date) < new Date(earliest.contact_date) ? contact : earliest,
  )

  const lastContact = contacts.reduce((latest, contact) =>
    new Date(contact.contact_date) > new Date(latest.contact_date) ? contact : latest,
  )

  const primaryProvider = contacts.reduce(
    (acc, contact) => {
      acc[contact.provider_name] = (acc[contact.provider_name] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostFrequentProvider = Object.entries(primaryProvider).reduce((a, b) =>
    primaryProvider[a[0]] > primaryProvider[b[0]] ? a : b,
  )[0]

  // Generate timeline events from contacts
  const timelineEvents = contacts.map((contact) => ({
    id: contact.id,
    date: contact.contact_date,
    type: "contact" as const,
    title: `${contact.service_type} Service`,
    description: contact.notes || `Contact with ${contact.provider_name}`,
    status: contact.service_completed ? ("completed" as const) : ("pending" as const),
    provider: contact.provider_name,
  }))

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{clientName}</h1>
            <Badge variant="secondary">{contacts.length} contacts</Badge>
          </div>
          <Button variant="outline" onClick={fetchClientData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <ClientBasicInfo
          clientName={clientName}
          totalContacts={contacts.length}
          firstContact={firstContact.contact_date}
          lastContact={lastContact.contact_date}
          primaryProvider={mostFrequentProvider}
        />

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Contact History</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <ClientContactHistory contacts={contacts} />
          </TabsContent>

          <TabsContent value="timeline">
            <ClientJourneyTimeline events={timelineEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
