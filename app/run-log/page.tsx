"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Filter,
  Plus,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  Users,
  Package,
  Clock,
  Activity,
} from "lucide-react"

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
  scheduled_time?: string
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

  const [runContacts, setRunContacts] = useState<RunContact[]>([])

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

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [contactSaved, setContactSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [runSummary, setRunSummary] = useState({
    contactCount: 0,
    servicesProvided: {} as Record<string, number>,
    inventoryItems: {} as Record<string, number>,
    runDuration: null as string | null,
    firstContactTime: null as string | null,
    lastContactTime: null as string | null,
  })

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const userName = "John Doe"

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  useEffect(() => {
    fetchTodayContacts()
    fetchLocations()
    fetchClients()
    fetchActiveRuns()
    fetchStaffMembers()
    setFormData((prev) => ({ ...prev, staff_member: "Andrea Leflore" }))
  }, [])

  useEffect(() => {
    updateRunSummary()
  }, [contacts])

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
          console.log("[v0] Compare run date:", runDate, "with today:", today)
          return runDate === today
        })

        const sortedRuns = todayRuns.sort((a: any, b: any) => {
          const timeA = a.scheduled_time || "00:00"
          const timeB = b.scheduled_time || "00:00"
          return timeA.localeCompare(timeB)
        })

        console.log("[v0] Today's runs found:", sortedRuns)
        setRuns(sortedRuns)
      }
    } catch (error) {
      console.error("Error fetching runs:", error)
    }
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Submitting form...")
    setSaveError(null)

    try {
      const submitData = {
        ...formData,
        location_id: formData.location_mode === "auto" ? null : formData.location_id,
        custom_location: formData.location_mode === "auto" ? formData.custom_location : null,
        client_name: formData.is_new_client
          ? `${formData.new_client_first_name} ${formData.new_client_last_name}`.trim()
          : formData.new_client_first_name || "Unknown Client",
        is_new_client: formData.new_client_first_name && !formData.client_id,
        new_client_first_name: formData.new_client_first_name,
        new_client_last_name: formData.new_client_last_name,
      }

      console.log("[v0] Submit data:", submitData)

      const response = await fetch("/api/outreach/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        console.log("[v0] Form submitted successfully")
        setContactSaved(true)
        await fetchTodayContacts()
      } else {
        const errorData = await response.json()
        console.error("[v0] Form submission failed:", errorData)
        setSaveError(errorData.message || "Failed to save contact. Please check your network connection and try again.")
      }
    } catch (error) {
      console.error("Error adding contact:", error)
      setSaveError(
        "Network error. Please check your connection and try again, or make a hard copy of this information.",
      )
    }
  }

  const handleSaveContact = async () => {
    await handleAddContact(new Event("submit") as any)
  }

  const handleCloseModal = () => {
    setShowAddDialog(false)
    setContactSaved(false)
    setSaveError(null)
    setTimeout(() => {
      resetForm()
    }, 100)
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
    setRunContacts([]) // Clear run-specific contacts on reset
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

  const canProceedToNextStep = () => {
    let canProceed = false
    switch (currentStep) {
      case 1:
        canProceed =
          formData.staff_member && (formData.location_mode === "auto" ? formData.custom_location : formData.location_id)
        break
      case 2:
        canProceed = formData.is_new_client
          ? formData.new_client_first_name && formData.new_client_last_name
          : formData.client_id || formData.new_client_first_name
        break
      case 3:
        canProceed = formData.services_provided.length > 0
        break
      case 4:
        canProceed = true
        break
      default:
        canProceed = false
    }

    console.log("[v0] Step", currentStep, "can proceed:", canProceed)
    if (currentStep === 3) {
      console.log("[v0] Services selected:", formData.services_provided)
    }

    return canProceed
  }

  const fetchRunContacts = async (runId: string) => {
    if (!runId) {
      setRunContacts([])
      return
    }

    try {
      console.log("[v0] Fetching contacts for run:", runId)
      const response = await fetch(`/api/outreach/contacts?run_id=${runId}`)
      if (response.ok) {
        const data = await response.json()
        const runSpecificContacts = data.map((contact: any) => ({
          id: contact.id,
          client_name: contact.client_name || contact.new_client_first_name || "Unknown Client",
          location_name: contact.location_name || contact.custom_location || "Unknown Location",
          contact_time: contact.contact_time || "Unknown Time",
          services_provided: contact.services_provided || [],
          follow_up_needed: contact.follow_up_needed || false,
        }))
        console.log("[v0] Run contacts found:", runSpecificContacts)
        setRunContacts(runSpecificContacts)
      }
    } catch (error) {
      console.error("Error fetching run contacts:", error)
      setRunContacts([])
    }
  }

  const handleRunChange = (runId: string) => {
    setFormData({ ...formData, run_id: runId })
    fetchRunContacts(runId)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <Label htmlFor="run_id" className="text-2xl font-bold mb-4 block text-foreground">
                Today's Run (Optional)
              </Label>
              <Select value={formData.run_id} onValueChange={handleRunChange}>
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select run (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {runs.map((run) => (
                    <SelectItem key={run.id} value={run.id.toString()} className="text-xl font-medium py-4">
                      {run.planned_locations && run.planned_locations.length > 0
                        ? `${Array.isArray(run.planned_locations) ? run.planned_locations[0] : JSON.parse(run.planned_locations)[0]} - ${run.scheduled_time || "No time"}`
                        : `Run ${run.id} - ${run.scheduled_time || "No time"}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-2xl font-bold mb-4 block text-foreground">Location</Label>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    type="button"
                    variant={formData.location_mode === "auto" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, location_mode: "auto", location_id: "" })}
                    className="h-16 text-xl font-semibold border-2 justify-start"
                  >
                    <MapPin className="w-6 h-6 mr-3" />
                    Auto-detect Location
                  </Button>
                  <Button
                    type="button"
                    variant={formData.location_mode === "manual" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, location_mode: "manual", custom_location: "" })}
                    className="h-16 text-xl font-semibold border-2 justify-start"
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
                      className="h-16 text-xl font-medium pr-16 border-2"
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
                    <SelectTrigger className="h-16 text-xl font-medium border-2">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.run_id ? getPlannedLocationsForRun(formData.run_id) : locations).map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                          className="text-xl font-medium py-4"
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="staff_member" className="text-2xl font-bold mb-4 block text-foreground">
                Staff Member
              </Label>
              <Select
                value={formData.staff_member}
                onValueChange={(value) => setFormData({ ...formData, staff_member: value })}
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.name} className="text-xl font-medium py-4">
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
              <Label className="text-2xl font-bold mb-4 block text-foreground">Select Person</Label>

              {runContacts.length > 0 && (
                <div className="space-y-4 mb-8">
                  <div className="text-xl font-semibold text-foreground">People already logged for this run:</div>
                  <div className="max-h-64 overflow-y-auto border-2 rounded-lg">
                    <div className="space-y-2 p-2">
                      {runContacts.map((contact) => (
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
                          className="w-full h-16 text-xl font-semibold justify-start border-2 px-4"
                        >
                          <div className="text-left">
                            <div className="font-bold">{contact.client_name}</div>
                            <div className="text-lg opacity-75">{contact.location_name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-xl font-semibold text-foreground">
                  {runContacts.length > 0 ? "Or enter new person's name:" : "Enter person's name:"}
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
                  placeholder="Type the person's name or nickname."
                  className="h-16 text-xl font-medium border-2"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-2xl font-bold mb-6 block text-foreground">Services Provided</Label>
              <div className="grid grid-cols-1 gap-4">
                {COMMON_SERVICES.map((service) => (
                  <Button
                    key={service}
                    type="button"
                    variant={formData.services_provided.includes(service) ? "default" : "outline"}
                    onClick={() => toggleService(service)}
                    className="h-16 text-xl font-semibold justify-start border-2"
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
            {contactSaved && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="text-green-800 font-bold text-xl mb-2">✓ Contact Saved Successfully!</div>
                <div className="text-green-700 text-lg font-medium">
                  The contact has been logged and added to today's list.
                </div>
              </div>
            )}

            {saveError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="text-red-800 font-bold text-xl mb-2">⚠ Save Failed</div>
                <div className="text-red-700 text-lg font-medium">{saveError}</div>
              </div>
            )}

            <div>
              <Label htmlFor="housing_status" className="text-2xl font-bold mb-4 block text-foreground">
                Housing Status
              </Label>
              <Select
                value={formData.housing_status}
                onValueChange={(value) => setFormData({ ...formData, housing_status: value })}
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select housing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsheltered" className="text-xl font-medium py-4">
                    Unsheltered
                  </SelectItem>
                  <SelectItem value="sheltered" className="text-xl font-medium py-4">
                    Sheltered
                  </SelectItem>
                  <SelectItem value="transitional" className="text-xl font-medium py-4">
                    Transitional Housing
                  </SelectItem>
                  <SelectItem value="temporary" className="text-xl font-medium py-4">
                    Temporary Stay
                  </SelectItem>
                  <SelectItem value="unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="medical_concerns" className="text-2xl font-bold mb-4 block text-foreground">
                Medical Concerns (Optional)
              </Label>
              <Textarea
                id="medical_concerns"
                value={formData.medical_concerns}
                onChange={(e) => setFormData({ ...formData, medical_concerns: e.target.value })}
                placeholder="Any medical concerns or observations"
                rows={4}
                className="text-xl font-medium border-2"
              />
            </div>

            <div className="space-y-4">
              <Button
                type="button"
                variant={formData.follow_up_needed ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, follow_up_needed: !formData.follow_up_needed })}
                className="h-16 text-xl font-semibold w-full border-2"
              >
                {formData.follow_up_needed ? "✓ Follow-up Needed" : "Follow-up Needed?"}
              </Button>

              {formData.follow_up_needed && (
                <div>
                  <Label htmlFor="follow_up_notes" className="text-xl font-bold mb-3 block text-foreground">
                    Follow-up Notes
                  </Label>
                  <Textarea
                    id="follow_up_notes"
                    value={formData.follow_up_notes}
                    onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                    placeholder="What follow-up is needed?"
                    rows={4}
                    className="text-xl font-medium border-2"
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

  const updateRunSummary = () => {
    if (contacts.length === 0) {
      setRunSummary({
        contactCount: 0,
        servicesProvided: {},
        inventoryItems: {},
        runDuration: null,
        firstContactTime: null,
        lastContactTime: null,
      })
      return
    }

    // Count contacts
    const contactCount = contacts.length

    // Aggregate services
    const servicesProvided: Record<string, number> = {}
    contacts.forEach((contact) => {
      if (contact.services_provided && Array.isArray(contact.services_provided)) {
        contact.services_provided.forEach((service) => {
          servicesProvided[service] = (servicesProvided[service] || 0) + 1
        })
      }
    })

    // For now, inventory items will be empty since we don't have that data structure yet
    const inventoryItems: Record<string, number> = {}

    // Calculate run duration
    const contactTimes = contacts
      .map((contact) => contact.contact_time)
      .filter((time) => time && time !== "Unknown Time")
      .sort()

    let runDuration = null
    let firstContactTime = null
    let lastContactTime = null

    if (contactTimes.length > 0) {
      firstContactTime = contactTimes[0]
      lastContactTime = contactTimes[contactTimes.length - 1]

      if (contactTimes.length > 1) {
        const first = new Date(`2000-01-01 ${firstContactTime}`)
        const last = new Date(`2000-01-01 ${lastContactTime}`)
        const diffMs = last.getTime() - first.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        if (diffHours > 0) {
          runDuration = `${diffHours}h ${diffMinutes}m`
        } else {
          runDuration = `${diffMinutes}m`
        }
      }
    }

    setRunSummary({
      contactCount,
      servicesProvided,
      inventoryItems,
      runDuration,
      firstContactTime,
      lastContactTime,
    })
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
      <Card className="shadow-lg border-2 mb-6">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/revive-impact-logo.png"
                alt="ReVive IMPACT Logo"
                width={120}
                height={34}
                className="h-8 w-auto"
                priority
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-lg font-semibold text-foreground hover:bg-slate-100 hover:text-slate-900 px-3 py-2 h-auto"
                  >
                    {userName}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    className="text-lg font-medium py-3 cursor-pointer hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900"
                    onClick={() => {
                      // Handle logout logic here
                      console.log("Logging out...")
                      // You can add actual logout functionality here
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Run Log</h1>
              <p className="text-xl font-medium text-foreground">{today}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="border-2 hover:bg-slate-100 hover:text-slate-900 bg-transparent text-lg font-semibold h-14"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-6 text-xl h-14"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-3xl font-bold text-foreground">Log Street Contact</DialogTitle>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${i + 1 <= currentStep ? "bg-primary" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-foreground">
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
                          className="h-16 text-xl font-semibold px-8 border-2 bg-transparent hover:bg-slate-100 hover:text-slate-900"
                          disabled={contactSaved}
                        >
                          <ChevronLeft className="w-5 h-5 mr-2" />
                          Back
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                        className="h-16 text-xl font-semibold px-6 border-2 bg-transparent hover:bg-slate-100 hover:text-slate-900"
                      >
                        {contactSaved ? "Close" : "Cancel"}
                      </Button>

                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!canProceedToNextStep()}
                          className="flex-1 h-16 text-xl font-bold"
                        >
                          Next
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSaveContact}
                          disabled={!canProceedToNextStep() || contactSaved}
                          className="flex-1 h-16 text-xl font-bold"
                        >
                          {contactSaved ? "✓ Contact Saved" : "Save Contact"}
                        </Button>
                      )}
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-lg border-2 mb-6">
        <CardHeader className="pb-4">
          <h2 className="text-2xl font-bold text-foreground">Live Run Summary</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Contacts Created */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">Contacts</h3>
              </div>
              <div className="text-3xl font-bold text-blue-900">{runSummary.contactCount}</div>
              <div className="text-sm font-medium text-blue-700">People contacted today</div>
            </div>

            {/* Services Provided */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-green-900">Services</h3>
              </div>
              <div className="text-3xl font-bold text-green-900">
                {Object.values(runSummary.servicesProvided).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm font-medium text-green-700">
                {Object.keys(runSummary.servicesProvided).length} different types
              </div>
            </div>

            {/* Inventory Items */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Package className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-orange-900">Inventory</h3>
              </div>
              <div className="text-3xl font-bold text-orange-900">
                {Object.values(runSummary.inventoryItems).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm font-medium text-orange-700">Items distributed</div>
            </div>

            {/* Run Duration */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">Duration</h3>
              </div>
              <div className="text-3xl font-bold text-purple-900">{runSummary.runDuration || "—"}</div>
              <div className="text-sm font-medium text-purple-700">
                {runSummary.firstContactTime && runSummary.lastContactTime
                  ? `${runSummary.firstContactTime} - ${runSummary.lastContactTime}`
                  : "No contacts yet"}
              </div>
            </div>
          </div>

          {/* Services Breakdown */}
          {Object.keys(runSummary.servicesProvided).length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-xl font-bold text-foreground mb-4">Services Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(runSummary.servicesProvided).map(([service, count]) => (
                  <div
                    key={service}
                    className="flex justify-between items-center bg-slate-50 border rounded-lg px-4 py-2"
                  >
                    <span className="text-lg font-medium text-foreground">{service}</span>
                    <span className="text-lg font-bold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
