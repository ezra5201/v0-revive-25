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
import { Filter, Plus, MapPin, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [currentAddress, setCurrentAddress] = useState<string>("")

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
    setFormData((prev) => ({ ...prev, staff_member: "Andrea Leflore" }))
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
        reverseGeocode(latitude, longitude)
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

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )

      if (response.ok) {
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setCurrentAddress(address)
        setFormData((prev) => ({
          ...prev,
          custom_location: address,
        }))
      } else {
        const coordsString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setCurrentAddress(coordsString)
        setFormData((prev) => ({
          ...prev,
          custom_location: coordsString,
        }))
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
      const coordsString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setCurrentAddress(coordsString)
      setFormData((prev) => ({
        ...prev,
        custom_location: coordsString,
      }))
    }
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
      console.log("[v0] Fetching runs...")
      const response = await fetch("/api/outreach/runs")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] All runs data:", data)

        const today = new Date().toISOString().split("T")[0]
        console.log("[v0] Today's date:", today)

        const todayRuns = data.filter((run: any) => {
          const runDate = new Date(run.run_date).toISOString().split("T")[0]
          console.log("[v0] Comparing run date:", runDate, "with today:", today)
          return runDate === today
        })

        console.log("[v0] Today's runs found:", todayRuns)
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
      staff_member: "Andrea Leflore",
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
    setCurrentAddress("")
    setCurrentStep(1)
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

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.staff_member && (formData.location_mode === "auto" ? formData.custom_location : formData.location_id)
        )
      case 2:
        return formData.is_new_client
          ? formData.new_client_first_name && formData.new_client_last_name
          : formData.client_id || formData.new_client_first_name
      case 3:
        return formData.services_provided.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <Label htmlFor="run_id" className="text-xl font-semibold mb-4 block">
                Today's Run (Optional)
              </Label>
              <Select value={formData.run_id} onValueChange={(value) => setFormData({ ...formData, run_id: value })}>
                <SelectTrigger className="h-16 text-lg border-2">
                  <SelectValue placeholder="Select run (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {runs.map((run) => (
                    <SelectItem key={run.id} value={run.id.toString()} className="text-lg py-4">
                      {run.lead_staff} - {run.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xl font-semibold mb-4 block">Location</Label>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    type="button"
                    variant={formData.location_mode === "auto" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, location_mode: "auto", location_id: "" })}
                    className="h-16 text-lg border-2 justify-start"
                  >
                    <MapPin className="w-6 h-6 mr-3" />
                    Auto-detect Location
                  </Button>
                  <Button
                    type="button"
                    variant={formData.location_mode === "manual" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, location_mode: "manual", custom_location: "" })}
                    className="h-16 text-lg border-2 justify-start"
                  >
                    Select from List
                  </Button>
                </div>

                {formData.location_mode === "auto" ? (
                  <div className="relative">
                    <Input
                      value={formData.custom_location}
                      onChange={(e) => setFormData({ ...formData, custom_location: e.target.value })}
                      placeholder={isGettingLocation ? "Getting location..." : "Street address or coordinates"}
                      className="h-16 text-lg pr-16 border-2"
                      disabled={isGettingLocation}
                    />
                    {isGettingLocation ? (
                      <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 animate-spin text-gray-400" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={getCurrentLocation}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0"
                      >
                        <MapPin className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                  >
                    <SelectTrigger className="h-16 text-lg border-2">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.run_id ? getPlannedLocationsForRun(formData.run_id) : locations).map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()} className="text-lg py-4">
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="staff_member" className="text-xl font-semibold mb-4 block">
                Staff Member
              </Label>
              <Select
                value={formData.staff_member}
                onValueChange={(value) => setFormData({ ...formData, staff_member: value })}
              >
                <SelectTrigger className="h-16 text-lg border-2">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.name} className="text-lg py-4">
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-xl font-semibold mb-4 block">Select Person</Label>

              {contacts.length > 0 && (
                <div className="space-y-4 mb-8">
                  <div className="text-lg font-medium text-muted-foreground">People already logged today:</div>
                  <div className="max-h-64 overflow-y-auto border-2 rounded-lg">
                    <div className="space-y-2 p-2">
                      {contacts.map((contact) => (
                        <Button
                          key={contact.id}
                          type="button"
                          variant={formData.client_id === contact.id.toString() ? "default" : "outline"}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              client_id: contact.id.toString(),
                              new_client_first_name: "", // Clear manual input when selecting from list
                            })
                          }
                          className="w-full h-16 text-lg justify-start border-2 px-4"
                        >
                          <div className="text-left">
                            <div className="font-semibold">{contact.client_name}</div>
                            <div className="text-sm opacity-75">{contact.location_name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-lg font-medium text-muted-foreground">
                  {contacts.length > 0 ? "Or enter new person's name:" : "Enter person's name:"}
                </div>
                <Input
                  value={formData.new_client_first_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      new_client_first_name: e.target.value,
                      client_id: "", // Clear selection when typing manually
                    })
                  }
                  placeholder="Type person's full name"
                  className="h-16 text-lg border-2"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-xl font-semibold mb-6 block">Services Provided</Label>
              <div className="grid grid-cols-1 gap-4">
                {COMMON_SERVICES.map((service) => (
                  <Button
                    key={service}
                    type="button"
                    variant={formData.services_provided.includes(service) ? "default" : "outline"}
                    onClick={() => toggleService(service)}
                    className="h-16 text-lg justify-start border-2"
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <Label htmlFor="housing_status" className="text-xl font-semibold mb-4 block">
                Housing Status
              </Label>
              <Select
                value={formData.housing_status}
                onValueChange={(value) => setFormData({ ...formData, housing_status: value })}
              >
                <SelectTrigger className="h-16 text-lg border-2">
                  <SelectValue placeholder="Select housing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsheltered" className="text-lg py-4">
                    Unsheltered
                  </SelectItem>
                  <SelectItem value="sheltered" className="text-lg py-4">
                    Sheltered
                  </SelectItem>
                  <SelectItem value="transitional" className="text-lg py-4">
                    Transitional Housing
                  </SelectItem>
                  <SelectItem value="temporary" className="text-lg py-4">
                    Temporary Stay
                  </SelectItem>
                  <SelectItem value="unknown" className="text-lg py-4">
                    Unknown
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="medical_concerns" className="text-xl font-semibold mb-4 block">
                Medical Concerns (Optional)
              </Label>
              <Textarea
                id="medical_concerns"
                value={formData.medical_concerns}
                onChange={(e) => setFormData({ ...formData, medical_concerns: e.target.value })}
                placeholder="Any medical concerns or observations"
                rows={4}
                className="text-lg border-2"
              />
            </div>

            <div className="space-y-4">
              <Button
                type="button"
                variant={formData.follow_up_needed ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, follow_up_needed: !formData.follow_up_needed })}
                className="h-16 text-lg w-full border-2"
              >
                {formData.follow_up_needed ? "✓ Follow-up Needed" : "Follow-up Needed?"}
              </Button>

              {formData.follow_up_needed && (
                <div>
                  <Label htmlFor="follow_up_notes" className="text-lg font-medium mb-3 block">
                    Follow-up Notes
                  </Label>
                  <Textarea
                    id="follow_up_notes"
                    value={formData.follow_up_notes}
                    onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                    placeholder="What follow-up is needed?"
                    rows={4}
                    className="text-lg border-2"
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
                <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold">Log Street Contact</DialogTitle>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${i + 1 <= currentStep ? "bg-primary" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium text-muted-foreground">
                        Step {currentStep} of {totalSteps}
                      </span>
                    </div>
                  </DialogHeader>

                  <form onSubmit={handleAddContact} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-1 py-4">{renderStepContent()}</div>

                    <div className="flex-shrink-0 flex gap-3 pt-6 border-t">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="h-16 text-lg px-8 border-2 bg-transparent"
                        >
                          <ChevronLeft className="w-5 h-5 mr-2" />
                          Back
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                        className="h-16 text-lg px-6 border-2"
                      >
                        Cancel
                      </Button>

                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!canProceedToNextStep()}
                          className="flex-1 h-16 text-lg font-semibold"
                        >
                          Next
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={!canProceedToNextStep()}
                          className="flex-1 h-16 text-lg font-semibold"
                        >
                          Log Contact
                        </Button>
                      )}
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
