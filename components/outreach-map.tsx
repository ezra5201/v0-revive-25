"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Users, Filter, Layers, Navigation } from "lucide-react"

interface OutreachLocation {
  id: number
  name: string
  intersection: string
  latitude?: number
  longitude?: number
  visit_count: number
  last_visited?: string
  safety_concerns?: string
  is_active: boolean
}

interface OutreachRun {
  id: number
  run_date: string
  lead_staff: string
  planned_locations: number[]
  actual_locations: number[]
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  total_contacts: number
}

export function OutreachMap() {
  const [locations, setLocations] = useState<OutreachLocation[]>([])
  const [runs, setRuns] = useState<OutreachRun[]>([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<OutreachLocation | null>(null)

  // Filters
  const [dateRange, setDateRange] = useState("30") // days
  const [runStatus, setRunStatus] = useState("all")
  const [activityLevel, setActivityLevel] = useState("all")

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    fetchData()
    loadMap()
  }, [])

  useEffect(() => {
    if (mapLoaded && locations.length > 0) {
      updateMapMarkers()
    }
  }, [mapLoaded, locations, runs, dateRange, runStatus, activityLevel])

  const fetchData = async () => {
    try {
      const [locationsRes, runsRes] = await Promise.all([fetch("/api/outreach/locations"), fetch("/api/outreach/runs")])

      if (locationsRes.ok && runsRes.ok) {
        const locationsData = await locationsRes.json()
        const runsData = await runsRes.json()

        setLocations(locationsData)
        setRuns(runsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMap = async () => {
    if (typeof window === "undefined") return

    try {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import("leaflet")).default

      // Import CSS
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map centered on Chicago
        const map = L.map(mapRef.current).setView([41.8781, -87.6298], 11)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        mapInstanceRef.current = map
        setMapLoaded(true)
      }
    } catch (error) {
      console.error("Error loading map:", error)
    }
  }

  const updateMapMarkers = async () => {
    if (!mapInstanceRef.current) return

    const L = (await import("leaflet")).default

    // Clear existing markers
    markersRef.current.forEach((marker) => mapInstanceRef.current.removeLayer(marker))
    markersRef.current = []

    // Filter runs based on date range and status
    const now = new Date()
    const daysAgo = new Date(now.getTime() - Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)
    const daysAhead = new Date(now.getTime() + Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)

    const filteredRuns = runs.filter((run) => {
      const runDate = new Date(run.run_date)
      const inDateRange = runDate >= daysAgo && runDate <= daysAhead
      const statusMatch = runStatus === "all" || run.status === runStatus
      return inDateRange && statusMatch
    })

    // Create markers for each location
    locations.forEach((location) => {
      if (!location.latitude || !location.longitude) return

      // Calculate activity level
      const locationRuns = filteredRuns.filter(
        (run) => run.planned_locations.includes(location.id) || run.actual_locations.includes(location.id),
      )

      const totalContacts = locationRuns.reduce((sum, run) => sum + run.total_contacts, 0)

      // Filter by activity level
      if (activityLevel === "high" && totalContacts < 10) return
      if (activityLevel === "medium" && (totalContacts < 3 || totalContacts >= 10)) return
      if (activityLevel === "low" && totalContacts >= 3) return

      // Determine marker color based on activity and safety
      let markerColor = "#3b82f6" // blue default
      if (location.safety_concerns)
        markerColor = "#ef4444" // red for safety concerns
      else if (totalContacts >= 10)
        markerColor = "#22c55e" // green for high activity
      else if (totalContacts >= 3) markerColor = "#f59e0b" // orange for medium activity

      // Create custom marker icon
      const markerIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${markerColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">
            ${totalContacts || ""}
          </div>
        `,
        className: "custom-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([location.latitude, location.longitude], { icon: markerIcon }).addTo(
        mapInstanceRef.current,
      )

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-1">${location.name}</h3>
          <p class="text-xs text-gray-600 mb-2">${location.intersection}</p>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span>Total visits:</span>
              <span class="font-medium">${location.visit_count}</span>
            </div>
            <div class="flex justify-between">
              <span>Recent contacts:</span>
              <span class="font-medium">${totalContacts}</span>
            </div>
            <div class="flex justify-between">
              <span>Last visited:</span>
              <span class="font-medium">${location.last_visited ? new Date(location.last_visited).toLocaleDateString() : "Never"}</span>
            </div>
            ${
              location.safety_concerns
                ? `
              <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p class="text-red-800 text-xs font-medium">⚠️ Safety Concerns</p>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.on("click", () => setSelectedLocation(location))

      markersRef.current.push(marker)
    })
  }

  const getActivityStats = () => {
    const now = new Date()
    const daysAgo = new Date(now.getTime() - Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)
    const daysAhead = new Date(now.getTime() + Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)

    const filteredRuns = runs.filter((run) => {
      const runDate = new Date(run.run_date)
      return runDate >= daysAgo && runDate <= daysAhead
    })

    const totalContacts = filteredRuns.reduce((sum, run) => sum + run.total_contacts, 0)
    const activeLocations = locations.filter((loc) => loc.is_active).length
    const safetyLocations = locations.filter((loc) => loc.safety_concerns).length

    return { totalContacts, activeLocations, safetyLocations, totalRuns: filteredRuns.length }
  }

  const stats = getActivityStats()

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
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chicago Outreach Map</h2>
          <p className="text-gray-600">Interactive map of outreach locations and run activity</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateRange" className="text-xs">
                Time Range
              </Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="runStatus" className="text-xs">
                Run Status
              </Label>
              <Select value={runStatus} onValueChange={setRunStatus}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All runs</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="activityLevel" className="text-xs">
                Activity Level
              </Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="high">High activity (10+ contacts)</SelectItem>
                  <SelectItem value="medium">Medium activity (3-9 contacts)</SelectItem>
                  <SelectItem value="low">Low activity (0-2 contacts)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Contacts</p>
                <p className="text-lg font-bold">{stats.totalContacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Locations</p>
                <p className="text-lg font-bold">{stats.activeLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Runs</p>
                <p className="text-lg font-bold">{stats.totalRuns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Navigation className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Safety Alerts</p>
                <p className="text-lg font-bold">{stats.safetyLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-[500px] lg:h-[600px] rounded-lg" style={{ minHeight: "400px" }} />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Map Legend</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
              <span>High Activity (10+ contacts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"></div>
              <span>Medium Activity (3-9 contacts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
              <span>Low Activity (0-2 contacts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
              <span>Safety Concerns</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{selectedLocation.name}</h3>
                <p className="text-gray-600 mb-3">{selectedLocation.intersection}</p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Visits:</span>
                    <p className="font-medium">{selectedLocation.visit_count}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Visited:</span>
                    <p className="font-medium">
                      {selectedLocation.last_visited
                        ? new Date(selectedLocation.last_visited).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={selectedLocation.is_active ? "default" : "secondary"} className="ml-1">
                      {selectedLocation.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {selectedLocation.safety_concerns && (
                    <div>
                      <span className="text-gray-500">Safety:</span>
                      <Badge variant="destructive" className="ml-1">
                        ⚠️ Concerns
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedLocation(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
