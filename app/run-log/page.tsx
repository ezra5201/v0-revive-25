"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Image from "next/image"
import Link from "next/link"
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
  List,
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
    staff_id: "",
    location_mode: "auto", // Default to auto-detect
    location_id: "",
    custom_location: "",
    run_id: "",
    client_name: "",
    client_age: "",
    client_gender: "",
    client_race: "",
    client_veteran_status: "", // Changed from client_veteran
    client_housing_status: "",
    client_income_source: "",
    client_disabilities: "",
    client_substance_use: "",
    client_mental_health: "",
    client_chronic_health: "",
    client_id_documents: "",
    client_phone: "",
    client_email: "",
    services_provided: [] as string[],
    inventory_provided: [] as string[],
    notes: "",
    contact_date: new Date().toISOString().split("T")[0],
    contact_time: new Date().toTimeString().slice(0, 5),
    follow_up_needed: false,
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

  const userName = "Andrea Leflore"

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
    setFormData((prev) => ({ ...prev, staff_id: "Andrea Leflore" }))
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
    setSaveError(null)

    try {
      const submitData = {
        ...formData,
        location_id: formData.location_mode === "auto" ? null : formData.location_id,
        custom_location: formData.location_mode === "auto" ? formData.custom_location : null,
        client_name: formData.client_name.trim() || "Unknown Client",
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
        updateRunSummary()
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
      staff_id: "",
      location_mode: "auto", // Default to auto-detect
      location_id: "",
      custom_location: "",
      run_id: "",
      client_name: "",
      client_age: "",
      client_gender: "",
      client_race: "",
      client_veteran_status: "", // Changed from client_veteran
      client_housing_status: "",
      client_income_source: "",
      client_disabilities: "",
      client_substance_use: "",
      client_mental_health: "",
      client_chronic_health: "",
      client_id_documents: "",
      client_phone: "",
      client_email: "",
      services_provided: [],
      inventory_provided: [],
      notes: "",
      contact_date: new Date().toISOString().split("T")[0],
      contact_time: new Date().toTimeString().slice(0, 5),
      follow_up_needed: false,
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
          formData.staff_id && (formData.location_mode === "auto" ? formData.custom_location : formData.location_id)
        break
      case 2:
        canProceed = formData.client_name
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
              <Label className="text-2xl font-bold mb-4 block text-foreground">Location</Label>
              <div className="space-y-6">
                {/* Primary Auto-detect Location Button */}
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, location_mode: "auto", location_id: "" })
                      getCurrentLocation()
                    }}
                    className="w-full h-16 text-xl font-semibold border-2 justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isGettingLocation}
                  >
                    <MapPin className="w-6 h-6 mr-3" />
                    {isGettingLocation ? "Getting Location..." : "Auto-detect Location"}
                  </Button>

                  {/* Address Input Field */}
                  <div className="relative">
                    <Input
                      value={formData.custom_location}
                      onChange={(e) => setFormData({ ...formData, custom_location: e.target.value })}
                      placeholder={isGettingLocation ? "Getting location..." : "Street address or coordinates"}
                      className="h-16 text-xl font-medium pr-16 border-2"
                      disabled={isGettingLocation}
                    />
                    {isGettingLocation && (
                      <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Alternative Option */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-lg font-medium text-gray-600 mb-3">Or select from scheduled locations:</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, location_mode: "manual", custom_location: "" })}
                      className="w-full h-14 text-lg font-medium border-2 justify-start"
                    >
                      <List className="w-5 h-5 mr-3" />
                      Select from List
                    </Button>
                  </div>
                </div>

                {/* Show dropdown only when manual mode is selected */}
                {formData.location_mode === "manual" && (
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
                value={formData.staff_id}
                onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
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
              <Label htmlFor="client_name" className="text-2xl font-bold mb-4 block text-foreground">
                Name
              </Label>
              <Input
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_name: e.target.value,
                  })
                }
                placeholder="Type the person's name or nickname."
                className="h-16 text-xl font-medium border-2"
              />
            </div>

            <div>
              <Label htmlFor="client_age" className="text-2xl font-bold mb-4 block text-foreground">
                Age
              </Label>
              <Input
                value={formData.client_age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_age: e.target.value,
                  })
                }
                placeholder="Type the person's age."
                className="h-16 text-xl font-medium border-2"
              />
            </div>

            <div>
              <Label htmlFor="client_gender" className="text-2xl font-bold mb-4 block text-foreground">
                Gender
              </Label>
              <Select
                value={formData.client_gender}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_gender: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select gender identity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Woman" className="text-xl font-medium py-4">
                    Woman
                  </SelectItem>
                  <SelectItem value="Man" className="text-xl font-medium py-4">
                    Man
                  </SelectItem>
                  <SelectItem value="Non-binary" className="text-xl font-medium py-4">
                    Non-binary
                  </SelectItem>
                  <SelectItem value="Transgender Woman" className="text-xl font-medium py-4">
                    Transgender Woman
                  </SelectItem>
                  <SelectItem value="Transgender Man" className="text-xl font-medium py-4">
                    Transgender Man
                  </SelectItem>
                  <SelectItem value="Gender Fluid" className="text-xl font-medium py-4">
                    Gender Fluid
                  </SelectItem>
                  <SelectItem value="Two-Spirit" className="text-xl font-medium py-4">
                    Two-Spirit
                  </SelectItem>
                  <SelectItem value="Other" className="text-xl font-medium py-4">
                    Other
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_race" className="text-2xl font-bold mb-4 block text-foreground">
                Race/Ethnicity
              </Label>
              <Select
                value={formData.client_race}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_race: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select race/ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="American Indian or Alaska Native" className="text-xl font-medium py-4">
                    American Indian or Alaska Native
                  </SelectItem>
                  <SelectItem value="Asian" className="text-xl font-medium py-4">
                    Asian
                  </SelectItem>
                  <SelectItem value="Black or African American" className="text-xl font-medium py-4">
                    Black or African American
                  </SelectItem>
                  <SelectItem value="Hispanic or Latino" className="text-xl font-medium py-4">
                    Hispanic or Latino
                  </SelectItem>
                  <SelectItem value="Native Hawaiian or Pacific Islander" className="text-xl font-medium py-4">
                    Native Hawaiian or Pacific Islander
                  </SelectItem>
                  <SelectItem value="White" className="text-xl font-medium py-4">
                    White
                  </SelectItem>
                  <SelectItem value="Multiracial" className="text-xl font-medium py-4">
                    Multiracial
                  </SelectItem>
                  <SelectItem value="Other" className="text-xl font-medium py-4">
                    Other
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_veteran" className="text-2xl font-bold mb-4 block text-foreground">
                Veteran Status
              </Label>
              <Select
                value={formData.client_veteran_status} // Changed from client_veteran
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_veteran_status: value, // Changed from client_veteran
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select veteran status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xl font-medium py-4">
                    Yes
                  </SelectItem>
                  <SelectItem value="No" className="text-xl font-medium py-4">
                    No
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_housing_status" className="text-2xl font-bold mb-4 block text-foreground">
                Housing Status
              </Label>
              <Select
                value={formData.client_housing_status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_housing_status: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select housing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unsheltered" className="text-xl font-medium py-4">
                    Unsheltered
                  </SelectItem>
                  <SelectItem value="Emergency Shelter" className="text-xl font-medium py-4">
                    Emergency Shelter
                  </SelectItem>
                  <SelectItem value="Transitional Housing" className="text-xl font-medium py-4">
                    Transitional Housing
                  </SelectItem>
                  <SelectItem value="Permanent Supportive Housing" className="text-xl font-medium py-4">
                    Permanent Supportive Housing
                  </SelectItem>
                  <SelectItem value="Rapid Rehousing" className="text-xl font-medium py-4">
                    Rapid Rehousing
                  </SelectItem>
                  <SelectItem value="Housed" className="text-xl font-medium py-4">
                    Housed
                  </SelectItem>
                  <SelectItem value="At Risk of Homelessness" className="text-xl font-medium py-4">
                    At Risk of Homelessness
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_income_source" className="text-2xl font-bold mb-4 block text-foreground">
                Income Source
              </Label>
              <Select
                value={formData.client_income_source}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_income_source: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select income source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employment" className="text-xl font-medium py-4">
                    Employment
                  </SelectItem>
                  <SelectItem value="SSI/SSDI" className="text-xl font-medium py-4">
                    SSI/SSDI
                  </SelectItem>
                  <SelectItem value="TANF" className="text-xl font-medium py-4">
                    TANF
                  </SelectItem>
                  <SelectItem value="Food Stamps/SNAP" className="text-xl font-medium py-4">
                    Food Stamps/SNAP
                  </SelectItem>
                  <SelectItem value="Unemployment" className="text-xl font-medium py-4">
                    Unemployment
                  </SelectItem>
                  <SelectItem value="Pension" className="text-xl font-medium py-4">
                    Pension
                  </SelectItem>
                  <SelectItem value="Other" className="text-xl font-medium py-4">
                    Other
                  </SelectItem>
                  <SelectItem value="None" className="text-xl font-medium py-4">
                    None
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_disabilities" className="text-2xl font-bold mb-4 block text-foreground">
                Disabilities
              </Label>
              <Select
                value={formData.client_disabilities}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_disabilities: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select disability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xl font-medium py-4">
                    Yes
                  </SelectItem>
                  <SelectItem value="No" className="text-xl font-medium py-4">
                    No
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_substance_use" className="text-2xl font-bold mb-4 block text-foreground">
                Substance Use Concerns
              </Label>
              <Select
                value={formData.client_substance_use}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_substance_use: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select substance use status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xl font-medium py-4">
                    Yes
                  </SelectItem>
                  <SelectItem value="No" className="text-xl font-medium py-4">
                    No
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_mental_health" className="text-2xl font-bold mb-4 block text-foreground">
                Mental Health Concerns
              </Label>
              <Select
                value={formData.client_mental_health}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_mental_health: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select mental health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xl font-medium py-4">
                    Yes
                  </SelectItem>
                  <SelectItem value="No" className="text-xl font-medium py-4">
                    No
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_chronic_health" className="text-2xl font-bold mb-4 block text-foreground">
                Chronic Health Conditions
              </Label>
              <Select
                value={formData.client_chronic_health}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_chronic_health: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select chronic health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xl font-medium py-4">
                    Yes
                  </SelectItem>
                  <SelectItem value="No" className="text-xl font-medium py-4">
                    No
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                  <SelectItem value="Prefer not to answer" className="text-xl font-medium py-4">
                    Prefer not to answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_id_documents" className="text-2xl font-bold mb-4 block text-foreground">
                ID Documents
              </Label>
              <Select
                value={formData.client_id_documents}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    client_id_documents: value,
                  })
                }
              >
                <SelectTrigger className="h-16 text-xl font-medium border-2">
                  <SelectValue placeholder="Select ID status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Has valid ID" className="text-xl font-medium py-4">
                    Has valid ID
                  </SelectItem>
                  <SelectItem value="Has expired ID" className="text-xl font-medium py-4">
                    Has expired ID
                  </SelectItem>
                  <SelectItem value="No ID" className="text-xl font-medium py-4">
                    No ID
                  </SelectItem>
                  <SelectItem value="Lost/Stolen ID" className="text-xl font-medium py-4">
                    Lost/Stolen ID
                  </SelectItem>
                  <SelectItem value="Unknown" className="text-xl font-medium py-4">
                    Unknown
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_phone" className="text-2xl font-bold mb-4 block text-foreground">
                Phone Number
              </Label>
              <Input
                value={formData.client_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_phone: e.target.value,
                  })
                }
                placeholder="Type the person's phone number."
                className="h-16 text-xl font-medium border-2"
              />
            </div>

            <div>
              <Label htmlFor="client_email" className="text-2xl font-bold mb-4 block text-foreground">
                Email Address
              </Label>
              <Input
                value={formData.client_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_email: e.target.value,
                  })
                }
                placeholder="Type the person's email address."
                className="h-16 text-xl font-medium border-2"
              />
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
                value={formData.client_housing_status}
                onValueChange={(value) => setFormData({ ...formData, client_housing_status: value })}
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
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

              <div className="flex gap-2 mb-3">
                <Link href="/run-log" className="flex-1">
                  <Button variant="default" className="w-full h-12 text-base font-semibold">
                    Run Log
                  </Button>
                </Link>
                <Link href="/contact-log" className="flex-1">
                  <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 bg-transparent">
                    Contact Log
                  </Button>
                </Link>
              </div>

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
