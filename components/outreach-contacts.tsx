"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, Users, MapPin, Calendar, AlertTriangle, CheckCircle, Search, User } from "lucide-react"

interface OutreachContact {
  id: number
  run_id: number
  client_id?: number
  location_id: number
  contact_date: string
  contact_time?: string
  staff_member: string
  services_provided: string[]
  supplies_given: Record<string, number>
  narcan_administered: boolean
  medical_concerns?: string
  housing_status?: string
  follow_up_needed: boolean
  follow_up_notes?: string
  created_at: string
  // Joined data
  client_name?: string
  location_name?: string
  run_date?: string
}

interface OutreachRun {
  id: number
  run_date: string
  lead_staff: string
  status: string
  planned_locations: number[]
}

interface OutreachLocation {
  id: number
  name: string
  intersection: string
}

interface OutreachClient {
  id: number
  first_name?: string
  last_name?: string
  ces_number?: string
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

const SUPPLY_TYPES = [
  { key: "narcan", label: "Narcan" },
  { key: "harm_reduction_kits", label: "Harm Reduction Kits" },
  { key: "food_bags", label: "Food Bags" },
  { key: "bus_cards", label: "Bus Cards" },
  { key: "clothing", label: "Clothing Items" },
  { key: "hygiene_kits", label: "Hygiene Kits" },
  { key: "gift_cards", label: "Gift Cards" },
  { key: "water_bottles", label: "Water Bottles" },
  { key: "blankets", label: "Blankets" },
  { key: "hand_warmers", label: "Hand Warmers" },
]

export function OutreachContacts() {
  const [contacts, setContacts] = useState<OutreachContact[]>([])
  const [runs, setRuns] = useState<OutreachRun[]>([])
  const [locations, setLocations] = useState<OutreachLocation[]>([])
  const [clients, setClients] = useState<OutreachClient[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filter, setFilter] = useState<"all" | "today" | "follow_up">("today")
  const [clientSearch, setClientSearch] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    run_id: "",
    client_id: "",
    location_id: "",
    staff_member: "",
    services_provided: [] as string[],
    supplies_given: {} as Record<string, number>,
    narcan_administered: false,
    medical_concerns: "",
    housing_status: "",
    follow_up_needed: false,
    follow_up_notes: "",
    // New client fields
    new_client_first_name: "",
    new_client_last_name: "",
    is_new_client: false,
  })

  useEffect(() => {
    fetchContacts()
    fetchRuns()
    fetchLocations()
    fetchClients()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/outreach/contacts")
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRuns = async () => {
    try {
      const response = await fetch("/api/outreach/runs")
      if (response.ok) {
        const data = await response.json()
        setRuns(data.filter((run: OutreachRun) => run.status === "in_progress" || run.status === "scheduled"))
      }
    } catch (error) {
      console.error("Error fetching runs:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/outreach/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.filter((loc: OutreachLocation) => loc.is_active))
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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/outreach/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchContacts()
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
      supplies_given: {},
      narcan_administered: false,
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

  const updateSupplyQuantity = (supplyKey: string, quantity: number) => {
    setFormData({
      ...formData,
      supplies_given: {
        ...formData.supplies_given,
        [supplyKey]: Math.max(0, quantity),
      },
    })
  }

  const filteredContacts = contacts.filter((contact) => {
    const today = new Date().toISOString().split("T")[0]

    switch (filter) {
      case "today":
        return contact.contact_date === today
      case "follow_up":
        return contact.follow_up_needed
      default:
        return true
    }
  })

  const filteredClients = clients.filter((client) => {
    if (!clientSearch) return clients.slice(0, 10) // Show first 10 if no search
    const searchLower = clientSearch.toLowerCase()
    const fullName = `${client.first_name || ""} ${client.last_name || ""}`.toLowerCase()
    return (
      fullName.includes(searchLower) || (client.ces_number && client.ces_number.toLowerCase().includes(searchLower))
    )
  })

  const activeRuns = runs.filter((run) => run.status === "in_progress")
  const todayContacts = contacts.filter((c) => c.contact_date === new Date().toISOString().split("T")[0])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Street Contacts</h2>
          <p className="text-gray-600">Log contacts made during outreach runs</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Log Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Street Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddContact} className="space-y-6">
              {/* Run and Location Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="run_id">Active Run</Label>
                  <Select
                    value={formData.run_id}
                    onValueChange={(value) => setFormData({ ...formData, run_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select run" />
                    </SelectTrigger>
                    <SelectContent>
                      {runs.map((run) => (
                        <SelectItem key={run.id} value={run.id.toString()}>
                          {run.run_date} - {run.lead_staff} ({run.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location_id">Location</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                  >
                    <SelectTrigger>
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
                <Label htmlFor="staff_member">Staff Member</Label>
                <Input
                  id="staff_member"
                  value={formData.staff_member}
                  onChange={(e) => setFormData({ ...formData, staff_member: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>

              {/* Client Selection */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <Label>Client</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_new_client"
                      checked={formData.is_new_client}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_new_client: !!checked, client_id: "" })
                      }
                    />
                    <Label htmlFor="is_new_client" className="text-sm">
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="new_client_last_name">Last Name</Label>
                      <Input
                        id="new_client_last_name"
                        value={formData.new_client_last_name}
                        onChange={(e) => setFormData({ ...formData, new_client_last_name: e.target.value })}
                        placeholder="Last name"
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
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                    >
                      <SelectTrigger>
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

              <Separator />

              {/* Services Provided */}
              <div>
                <Label className="text-base font-medium">Services Provided</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
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

              <Separator />

              {/* Supplies Given */}
              <div>
                <Label className="text-base font-medium">Supplies Distributed</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {SUPPLY_TYPES.map((supply) => (
                    <div key={supply.key} className="flex items-center justify-between">
                      <Label className="text-sm">{supply.label}</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSupplyQuantity(supply.key, (formData.supplies_given[supply.key] || 0) - 1)
                          }
                          disabled={(formData.supplies_given[supply.key] || 0) <= 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm">{formData.supplies_given[supply.key] || 0}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSupplyQuantity(supply.key, (formData.supplies_given[supply.key] || 0) + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Medical and Follow-up */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="narcan_administered"
                    checked={formData.narcan_administered}
                    onCheckedChange={(checked) => setFormData({ ...formData, narcan_administered: !!checked })}
                  />
                  <Label htmlFor="narcan_administered" className="text-sm font-medium text-red-600">
                    Narcan Administered
                  </Label>
                </div>

                <div>
                  <Label htmlFor="medical_concerns">Medical Concerns</Label>
                  <Textarea
                    id="medical_concerns"
                    value={formData.medical_concerns}
                    onChange={(e) => setFormData({ ...formData, medical_concerns: e.target.value })}
                    placeholder="Any medical concerns or observations"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="housing_status">Housing Status</Label>
                  <Select
                    value={formData.housing_status}
                    onValueChange={(value) => setFormData({ ...formData, housing_status: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="follow_up_needed" className="text-sm font-medium">
                    Follow-up Needed
                  </Label>
                </div>

                {formData.follow_up_needed && (
                  <div>
                    <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                    <Textarea
                      id="follow_up_notes"
                      value={formData.follow_up_notes}
                      onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                      placeholder="What follow-up is needed?"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Log Contact
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Contacts</p>
                <p className="text-2xl font-bold">{todayContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Runs</p>
                <p className="text-2xl font-bold">{activeRuns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Follow-ups Needed</p>
                <p className="text-2xl font-bold">{contacts.filter((c) => c.follow_up_needed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "today", label: "Today" },
          { key: "follow_up", label: "Follow-up Needed" },
          { key: "all", label: "All Contacts" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.key as any)}
            className="whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{contact.client_name || "Unknown Client"}</h3>
                    {contact.follow_up_needed && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Follow-up
                      </Badge>
                    )}
                    {contact.narcan_administered && (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                        Narcan
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(contact.contact_date).toLocaleDateString()}
                      {contact.contact_time && ` at ${contact.contact_time}`}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {contact.location_name}
                    </p>
                    <p className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Staff: {contact.staff_member}
                    </p>

                    {contact.services_provided.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.services_provided.slice(0, 3).map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {contact.services_provided.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.services_provided.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {Object.keys(contact.supplies_given).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Supplies:{" "}
                        {Object.entries(contact.supplies_given)
                          .filter(([_, qty]) => qty > 0)
                          .map(([item, qty]) => `${item}: ${qty}`)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-4">
                {filter === "today" ? "No contacts logged today." : `No ${filter} contacts found.`}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
