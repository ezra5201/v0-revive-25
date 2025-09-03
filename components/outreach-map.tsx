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
  address?: string
  latitude?: number
  longitude?: number
  visit_count: number
  last_visited?: string
  safety_concerns?: string
  is_active: boolean
  notes?: string
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
  const [showAllLocations, setShowAllLocations] = useState(false)

  // Filters
  const [dateRange, setDateRange] = useState("30") // days
  const [runStatus, setRunStatus] = useState("all")
  const [activityLevel, setActivityLevel] = useState("all")

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const reviveCenter: OutreachLocation = {
    id: -1, // Use negative ID to distinguish from database locations
    name: "Revive Center",
    intersection: "1668 W Ogden Ave",
    address: "1668 W Ogden Ave, Chicago, IL 60612",
    latitude: 41.8656,
    longitude: -87.6693,
    visit_count: 0,
    is_active: true,
    notes: "Main Revive Center location",
  }

  useEffect(() => {
    if (showAllLocations) {
      fetchData()
    } else {
      setLoading(false)
    }
    loadMap()
  }, [showAllLocations])

  useEffect(() => {
    if (mapLoaded) {
      updateMapMarkers()
    }
  }, [mapLoaded, locations, runs, dateRange, runStatus, activityLevel, showAllLocations])

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
      console.log("[v0] Starting map initialization...")

      const L = (await import("leaflet")).default
      console.log("[v0] Leaflet imported successfully")

      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
      console.log("[v0] Leaflet CSS loaded")

      await new Promise((resolve) => {
        link.onload = resolve
        setTimeout(resolve, 1000)
      })

      if (mapRef.current && !mapInstanceRef.current) {
        console.log("[v0] Initializing map container...")

        mapRef.current.style.height = "500px"
        mapRef.current.style.width = "100%"

        const map = L.map(mapRef.current).setView([reviveCenter.latitude!, reviveCenter.longitude!], 14)
        console.log("[v0] Map instance created")

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map)
        console.log("[v0] Map tiles added")

        mapInstanceRef.current = map
        setMapLoaded(true)
        console.log("[v0] Map initialization complete")
      }
    } catch (error) {
      console.error("[v0] Error loading map:", error)
    }
  }

  const updateMapMarkers = async () => {
    if (!mapInstanceRef.current) return

    const L = (await import("leaflet")).default

    markersRef.current.forEach((marker) => mapInstanceRef.current.removeLayer(marker))
    markersRef.current = []

    const reviveCenterIcon = L.divIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 6px 16px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
              text-shadow: 0 1px 3px rgba(0,0,0,0.7);
            ">
              🏠
            </div>
          </div>
          <div style="
            width: 18px;
            height: 10px;
            background: rgba(0,0,0,0.4);
            border-radius: 50%;
            margin-top: -4px;
            filter: blur(3px);
          "></div>
        </div>
      `,
      className: "custom-pin-marker revive-center-marker",
      iconSize: [44, 52],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    })

    const reviveMarker = L.marker([reviveCenter.latitude!, reviveCenter.longitude!], {
      icon: reviveCenterIcon,
    }).addTo(mapInstanceRef.current)

    const reviveTooltipContent = `
      <div style="font-size: 12px; line-height: 1.3;">
        <strong>${reviveCenter.name}</strong><br/>
        ${reviveCenter.address}
      </div>
    `

    reviveMarker.bindTooltip(reviveTooltipContent, {
      permanent: false,
      direction: "top",
      offset: [0, -10],
      className: "custom-tooltip",
    })

    const revivePopupContent = `
      <div class="p-3 min-w-[220px]">
        <h3 class="font-semibold text-base mb-2">${reviveCenter.name}</h3>
        <p class="text-sm text-gray-600 mb-3">${reviveCenter.address}</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Type:</span>
            <span class="font-medium text-purple-600">Main Center</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Status:</span>
            <span class="font-medium text-green-600">Active</span>
          </div>
          <div class="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
            <p class="text-purple-800 text-xs font-medium">🏠 Revive Center</p>
            <p class="text-purple-700 text-xs mt-1">Main outreach coordination hub</p>
          </div>
        </div>
      </div>
    `

    reviveMarker.bindPopup(revivePopupContent, {
      maxWidth: 300,
      className: "custom-popup",
    })

    markersRef.current.push(reviveMarker)

    if (!showAllLocations) return

    const now = new Date()
    const daysAgo = new Date(now.getTime() - Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)
    const daysAhead = new Date(now.getTime() + Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)

    const filteredRuns = runs.filter((run) => {
      const runDate = new Date(run.run_date)
      const inDateRange = runDate >= daysAgo && runDate <= daysAhead
      const statusMatch = runStatus === "all" || run.status === runStatus
      return inDateRange && statusMatch
    })

    locations.forEach((location) => {
      if (!location.latitude || !location.longitude) return

      const locationRuns = filteredRuns.filter(
        (run) => run.planned_locations.includes(location.id) || run.actual_locations.includes(location.id),
      )

      const totalContacts = locationRuns.reduce((sum, run) => sum + run.total_contacts, 0)

      if (activityLevel === "high" && totalContacts < 10) return
      if (activityLevel === "medium" && (totalContacts < 3 || totalContacts >= 10)) return
      if (activityLevel === "low" && totalContacts >= 3) return

      let markerColor = "#3b82f6"
      let borderColor = "#1e40af"
      if (location.safety_concerns) {
        markerColor = "#ef4444"
        borderColor = "#dc2626"
      } else if (totalContacts >= 10) {
        markerColor = "#22c55e"
        borderColor = "#16a34a"
      } else if (totalContacts >= 3) {
        markerColor = "#f59e0b"
        borderColor = "#d97706"
      }

      const markerIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              background: linear-gradient(135deg, ${markerColor} 0%, ${borderColor} 100%);
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-size: 12px;
                font-weight: bold;
                text-shadow: 0 1px 3px rgba(0,0,0,0.7);
              ">
                ${totalContacts || ""}
              </div>
            </div>
            <div style="
              width: 16px;
              height: 8px;
              background: rgba(0,0,0,0.3);
              border-radius: 50%;
              margin-top: -3px;
              filter: blur(2px);
            "></div>
          </div>
        `,
        className: "custom-pin-marker",
        iconSize: [40, 48],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      })

      const marker = L.marker([location.latitude, location.longitude], { icon: markerIcon }).addTo(
        mapInstanceRef.current,
      )

      const tooltipContent = `
        <div style="font-size: 12px; line-height: 1.3;">
          <strong>${location.name}</strong><br/>
          ${location.intersection || location.address || "No address available"}
          ${location.safety_concerns ? '<br/><span style="color: #ef4444;">⚠️ Safety Alert</span>' : ""}
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
        className: "custom-tooltip",
      })

      const popupContent = `
        <div class="p-3 min-w-[220px]">
          <h3 class="font-semibold text-base mb-2">${location.name}</h3>
          <p class="text-sm text-gray-600 mb-3">${location.intersection || location.address || "No address available"}</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Total visits:</span>
              <span class="font-medium">${location.visit_count}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Recent contacts:</span>
              <span class="font-medium">${totalContacts}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Last visited:</span>
              <span class="font-medium">${location.last_visited ? new Date(location.last_visited).toLocaleDateString() : "Never"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Status:</span>
              <span class="font-medium ${location.is_active ? "text-green-600" : "text-gray-500"}">${location.is_active ? "Active" : "Inactive"}</span>
            </div>
            ${
              location.safety_concerns
                ? `
              <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                <p class="text-red-800 text-xs font-medium">⚠️ Safety Concerns</p>
                <p class="text-red-700 text-xs mt-1">${location.safety_concerns}</p>
              </div>
            `
                : ""
            }
            ${
              location.notes
                ? `
              <div class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p class="text-blue-800 text-xs font-medium">📝 Notes</p>
                <p class="text-blue-700 text-xs mt-1">${location.notes}</p>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      })

      marker.on("mouseover", function () {
        this.openTooltip()
      })

      marker.on("mouseout", function () {
        this.closeTooltip()
      })

      marker.on("click", () => setSelectedLocation(location))

      markersRef.current.push(marker)
    })
  }

  const getActivityStats = () => {
    if (!showAllLocations) {
      return { totalContacts: 0, activeLocations: 1, safetyLocations: 0, totalRuns: 0 }
    }

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
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chicago Outreach Map</h2>
          <p className="text-gray-600">Interactive map of outreach locations and run activity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showAllLocations ? "outline" : "default"}
            onClick={() => setShowAllLocations(!showAllLocations)}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            {showAllLocations ? "Show Revive Center Only" : "Load All Locations"}
          </Button>
        </div>
      </div>

      {showAllLocations && (
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
      )}

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

      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="w-full rounded-lg"
            style={{ height: "500px", minHeight: "500px", position: "relative" }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          <style jsx global>{`
            .custom-tooltip {
              background: rgba(0, 0, 0, 0.9) !important;
              border: none !important;
              border-radius: 8px !important;
              color: white !important;
              font-size: 13px !important;
              padding: 10px 12px !important;
              box-shadow: 0 6px 20px rgba(0,0,0,0.4) !important;
              font-weight: 500 !important;
            }
            
            .custom-tooltip:before {
              border-top-color: rgba(0, 0, 0, 0.9) !important;
            }
            
            .custom-popup .leaflet-popup-content-wrapper {
              border-radius: 12px !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
            }
            
            .custom-pin-marker {
              cursor: pointer;
              transition: all 0.2s ease;
              z-index: 100;
            }
            
            .custom-pin-marker:hover {
              transform: scale(1.15);
              z-index: 1000;
            }
            
            .revive-center-marker {
              z-index: 200 !important;
            }
            
            .revive-center-marker:hover {
              transform: scale(1.2);
              z-index: 1001;
            }
            
            .leaflet-container {
              background: #f8fafc !important;
            }
            
            .leaflet-control-zoom a {
              background: white !important;
              border: 2px solid #e2e8f0 !important;
              color: #475569 !important;
            }
            
            .leaflet-control-zoom a:hover {
              background: #f1f5f9 !important;
              border-color: #cbd5e1 !important;
            }
          `}</style>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Map Legend</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Locations</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white shadow-md transform rotate-45 flex items-center justify-center"
                  style={{ borderRadius: "50% 50% 50% 0" }}
                >
                  <span className="transform -rotate-45 text-xs">🏠</span>
                </div>
                <span>Revive Center (Main Hub)</span>
              </div>
              {showAllLocations && (
                <>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md transform rotate-45"
                      style={{ borderRadius: "50% 50% 50% 0" }}
                    ></div>
                    <span>High Activity (10+ contacts)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-md transform rotate-45"
                      style={{ borderRadius: "50% 50% 50% 0" }}
                    ></div>
                    <span>Medium Activity (3-9 contacts)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md transform rotate-45"
                      style={{ borderRadius: "50% 50% 50% 0" }}
                    ></div>
                    <span>Low Activity (0-2 contacts)</span>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Special Indicators</h4>
              {showAllLocations && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md transform rotate-45"
                    style={{ borderRadius: "50% 50% 50% 0" }}
                  ></div>
                  <span>Safety Concerns</span>
                </div>
              )}
              <div className="text-xs text-gray-600 mt-2">
                <strong>💡 Tip:</strong> Hover over pins for quick address info, click for detailed information
              </div>
              {!showAllLocations && (
                <div className="text-xs text-blue-600 mt-2">
                  <strong>🚀 Performance:</strong> Click "Load All Locations" to see outreach data
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
