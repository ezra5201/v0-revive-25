"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Plus, Search } from "lucide-react"

interface RunContact {
  id: number
  client_name: string
  location_name: string
  contact_time: string
  services_provided: string[]
  follow_up_needed: boolean
}

interface OutreachLocation {
  id: number
  name: string
}

interface OutreachClient {
  id: number
  first_name?: string
  last_name?: string
  ces_number?: string
}

interface OutreachRun {
  id: number
  run_date: string
  lead_staff: string
  status: string
}

const COMMON_SERVICES = [
  "Housing Assessment",
  "Case Management",
  "Medical Referral",
  "Mental Health Support",
  "Substance Abuse Resources",
  "Benefits Application",
  "ID/Documentation Help",
  "Transportation Assistance",
  "Emergency Shelter",
  "Food Resources",
  "Clothing",
  "Harm Reduction",
]

export default function RunLogPage() {
  const [contacts, setContacts] = useState<RunContact[]>([])
  const [locations, setLocations] = useState<OutreachLocation[]>([])
  const [clients, setClients] = useState<OutreachClient[]>([])
  const [runs, setRuns] = useState<OutreachRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [clientSearch, setClientSearch] = useState("")

  const [formData, setFormData] = useState({
    run_id: "",
    client_id: "",
    location_id: "",
    staff_member: "",
    services_provided: [] as string[],
    medical_concerns: "",
    housing_status: "",
    follow_up_needed: false,
    follow_up_notes: "",
    new_client_first_name: "",
    new_client_last_name: "",
    is_new_client: false,
  })

  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Mock user name - in real app this would come from auth
  const userName = "John Doe"

  useEffect(() => {
    fetchTodayContacts()
    fetchLocations()
    fetchClients()
    fetchActiveRuns()
  }, [])

  const fetchTodayContacts = async () => {
    try {
      const response = await fetch("/api/outreach/contacts")
      if (response.ok) {
        const data = await response.json()
        const today = new Date().toISOString().split("T")[0]
        const todayContacts = data
          .filter((contact: any) => contact.contact_date === today)
          .map((contact: any) => ({
            id: contact.id,
            client_name: contact.client_name || "Unknown Client",
            location_name: contact.location_name || "Unknown Location",
            contact_time: contact.contact_time || "Unknown Time",
            services_provided: contact.services_provided || [],
            follow_up_needed: contact.follow_up_needed || false,
          }))
        setContacts(todayContacts)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/outreach/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.filter((loc: any) => loc.is_active))
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/outreach/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchActiveRuns = async () => {
    try {
      const response = await fetch("/api/outreach/runs")
      if (response.ok) {
        const data = await response.json()
        const today = new Date().toISOString().split("T")[0]
        const todayRuns = data.filter(
          (run: any) => run.run_date === today && (run.status === "in_progress" || run.status === "scheduled"),
        )
        setRuns(todayRuns)
      }
    } catch (error) {
      console.error("Error fetching runs:", error)
    }
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/outreach/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchTodayContacts()
        setShowAddDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding contact:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      run_id: "",
      client_id: "",
      location_id: "",
      staff_member: "",
      services_provided: [],
      medical_concerns: "",
      housing_status: "",
      follow_up_needed: false,
      follow_up_notes: "",
      new_client_first_name: "",
      new_client_last_name: "",
      is_new_client: false,
    })
    setClientSearch("")
  }

  const toggleService = (service: string) => {
    const isSelected = formData.services_provided.includes(service)
    setFormData({
      ...formData,
      services_provided: isSelected
        ? formData.services_provided.filter((s) => s !== service)
        : [...formData.services_provided, service],
    })
  }

  const filteredClients = clients.filter((client) => {
    if (!clientSearch) return clients.slice(0, 10)
    const searchLower = clientSearch.toLowerCase()
    const fullName = `${client.first_name || ""} ${client.last_name || ""}`.toLowerCase()
    return (
      fullName.includes(searchLower) || (client.ces_number && client.ces_number.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Image
            src="/revive-impact-logo.png"
            alt="ReVive IMPACT Logo"
            width={120}
            height={34}
            className="h-8 w-auto"
            priority
          />
          <div className="text-sm font-medium text-muted-foreground">{userName}</div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Run Log</h1>
              <p className="text-lg text-muted-foreground">{today}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="lg" className="border-2 hover:bg-muted/50 bg-transparent">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Log Street Contact</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddContact} className="space-y-6">
                    {/* Run and Location Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="run_id" className="text-base font-medium">
                          Today's Run
                        </Label>
                        <Select
                          value={formData.run_id}
                          onValueChange={(value) => setFormData({ ...formData, run_id: value })}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select run" />
                          </SelectTrigger>
                          <SelectContent>
                            {runs.map((run) => (
                              <SelectItem key={run.id} value={run.id.toString()}>
                                {run.lead_staff} - {run.status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="location_id" className="text-base font-medium">
                          Location
                        </Label>
                        <Select
                          value={formData.location_id}
                          onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="staff_member" className="text-base font-medium">
                        Staff Member
                      </Label>
                      <Input
                        id="staff_member"
                        value={formData.staff_member}
                        onChange={(e) => setFormData({ ...formData, staff_member: e.target.value })}
                        placeholder="Your name"
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    {/* Client Selection */}
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <Label className="text-base font-medium">Client</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_new_client"
                            checked={formData.is_new_client}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, is_new_client: !!checked, client_id: "" })
                            }
                          />
                          <Label htmlFor="is_new_client" className="text-base">
                            New client
                          </Label>
                        </div>
                      </div>

                      {formData.is_new_client ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new_client_first_name">First Name</Label>
                            <Input
                              id="new_client_first_name"
                              value={formData.new_client_first_name}
                              onChange={(e) => setFormData({ ...formData, new_client_first_name: e.target.value })}
                              placeholder="First name"
                              className="h-12 text-base"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_client_last_name">Last Name</Label>
                            <Input
                              id="new_client_last_name"
                              value={formData.new_client_last_name}
                              onChange={(e) => setFormData({ ...formData, new_client_last_name: e.target.value })}
                              placeholder="Last name"
                              className="h-12 text-base"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="relative mb-2">
                            <Input
                              placeholder="Search existing clients..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              className="pl-10 h-12 text-base"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                          <Select
                            value={formData.client_id}
                            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                          >
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select existing client" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredClients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.first_name} {client.last_name} {client.ces_number && `(${client.ces_number})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Services Provided */}
                    <div>
                      <Label className="text-base font-medium">Services Provided</Label>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {COMMON_SERVICES.map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={`service-${service}`}
                              checked={formData.services_provided.includes(service)}
                              onCheckedChange={() => toggleService(service)}
                            />
                            <Label htmlFor={`service-${service}`} className="text-sm">
                              {service}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="medical_concerns" className="text-base font-medium">
                          Medical Concerns
                        </Label>
                        <Textarea
                          id="medical_concerns"
                          value={formData.medical_concerns}
                          onChange={(e) => setFormData({ ...formData, medical_concerns: e.target.value })}
                          placeholder="Any medical concerns or observations"
                          rows={3}
                          className="text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="housing_status" className="text-base font-medium">
                          Housing Status
                        </Label>
                        <Select
                          value={formData.housing_status}
                          onValueChange={(value) => setFormData({ ...formData, housing_status: value })}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select housing status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unsheltered">Unsheltered</SelectItem>
                            <SelectItem value="sheltered">Sheltered</SelectItem>
                            <SelectItem value="transitional">Transitional Housing</SelectItem>
                            <SelectItem value="temporary">Temporary Stay</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="follow_up_needed"
                          checked={formData.follow_up_needed}
                          onCheckedChange={(checked) => setFormData({ ...formData, follow_up_needed: !!checked })}
                        />
                        <Label htmlFor="follow_up_needed" className="text-base font-medium">
                          Follow-up Needed
                        </Label>
                      </div>

                      {formData.follow_up_needed && (
                        <div>
                          <Label htmlFor="follow_up_notes" className="text-base font-medium">
                            Follow-up Notes
                          </Label>
                          <Textarea
                            id="follow_up_notes"
                            value={formData.follow_up_notes}
                            onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                            placeholder="What follow-up is needed?"
                            rows={3}
                            className="text-base"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1 h-12 text-base font-semibold">
                        Log Contact
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                        className="h-12 text-base"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Contacts Table */}
          <div className="border-2 border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-lg font-semibold text-foreground py-4 px-6">Location</TableHead>
                  <TableHead className="text-lg font-semibold text-foreground py-4 px-6">Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12 text-lg text-muted-foreground">
                      No contacts logged today. Tap "+ Contact" to add your first entry.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-muted/30">
                      <TableCell className="py-4 px-6 text-lg font-medium">{contact.location_name}</TableCell>
                      <TableCell className="py-4 px-6 text-lg">{contact.client_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
