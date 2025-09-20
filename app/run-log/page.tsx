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
import { Filter, Plus, Search, MapPin, Loader2 } from "lucide-react"

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
  latitude?: number
  longitude?: number
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
  planned_locations?: string[]
}

interface StaffMember {
  id: number
  name: string
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
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [formData, setFormData] = useState({
    run_id: "",
    client_id: "",
    location_id: "",
    staff_member: "",
    location_mode: "manual",
    custom_location: "",
    services_provided: [] as string[],
    medical_concerns: "",
    housing_status: "",
    follow_up_needed: false,
    follow_up_notes: "",
    new_client_first_name: "",
    new_client_last_name: "",
    is_new_client: false,
  })

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const userName = "John Doe"

  useEffect(() => {
    fetchTodayContacts()
    fetchLocations()
    fetchClients()
    fetchActiveRuns()
    fetchStaffMembers()
    setFormData((prev) => ({ ...prev, staff_member: userName }))
  }, [])

  useEffect(() => {
    if (formData.location_mode === "auto" && !currentLocation) {
      getCurrentLocation()
    }
  }, [formData.location_mode])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        setFormData((prev) => ({
          ...prev,
          custom_location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }))
        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please select manually.")
        setFormData((prev) => ({ ...prev, location_mode: "manual" }))
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch("/api/outreach/staff")
      if (response.ok) {
        const data = await response.json()
        setStaffMembers(data)
      }
    } catch (error) {
      console.error("Error fetching staff members:", error)
    }
  }

  const getPlannedLocationsForRun = (runId: string) => {
    const selectedRun = runs.find((run) => run.id.toString() === runId)
    if (!selectedRun?.planned_locations) return locations

    try {
      const plannedLocationNames = Array.isArray(selectedRun.planned_locations)
        ? selectedRun.planned_locations
        : JSON.parse(selectedRun.planned_locations)

      return locations.filter((loc) =>
        plannedLocationNames.some((planned: string) => loc.name.toLowerCase().includes(planned.toLowerCase())),
      )
    } catch {
      return locations
    }
  }

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
      const submitData = {
        ...formData,
        location_id: formData.location_mode === "auto" ? null : formData.location_id,
        custom_location: formData.location_mode === "auto" ? formData.custom_location : null,
      }

      const response = await fetch("/api/outreach/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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
      staff_member: userName,
      location_mode: "manual",
      custom_location: "",
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
    setCurrentLocation(null)
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
                        <Label className="text-base font-medium">Location</Label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="location-auto"
                                name="location-mode"
                                checked={formData.location_mode === "auto"}
                                onChange={() => setFormData({ ...formData, location_mode: "auto", location_id: "" })}
                                className="w-4 h-4"
                              />
                              <Label htmlFor="location-auto" className="text-sm">
                                Auto-detect
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="location-manual"
                                name="location-mode"
                                checked={formData.location_mode === "manual"}
                                onChange={() =>
                                  setFormData({ ...formData, location_mode: "manual", custom_location: "" })
                                }
                                className="w-4 h-4"
                              />
                              <Label htmlFor="location-manual" className="text-sm">
                                Select from list
                              </Label>
                            </div>
                          </div>

                          {formData.location_mode === "auto" ? (
                            <div className="relative">
                              <Input
                                value={formData.custom_location}
                                onChange={(e) => setFormData({ ...formData, custom_location: e.target.value })}
                                placeholder={isGettingLocation ? "Getting location..." : "Latitude, Longitude"}
                                className="h-12 text-base pr-10"
                                disabled={isGettingLocation}
                              />
                              {isGettingLocation ? (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={getCurrentLocation}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                                >
                                  <MapPin className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Select
                              value={formData.location_id}
                              onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                            >
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                {(formData.run_id ? getPlannedLocationsForRun(formData.run_id) : locations).map(
                                  (location) => (
                                    <SelectItem key={location.id} value={location.id.toString()}>
                                      {location.name}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="staff_member" className="text-base font-medium">
                        Staff Member
                      </Label>
                      <Select
                        value={formData.staff_member}
                        onValueChange={(value) => setFormData({ ...formData, staff_member: value })}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.name}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
