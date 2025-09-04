"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MapPin, Plus, Edit, Eye, AlertTriangle, Calendar, Users, List, Map, Layers } from "lucide-react"

interface OutreachLocation {
  id: number
  name: string
  address?: string
  intersection: string
  latitude?: number
  longitude?: number
  notes?: string
  safety_concerns?: string
  last_visited?: string
  visit_count: number
  is_active: boolean
  created_at: string
  updated_at: string
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

export function OutreachLocations() {
  const [locations, setLocations] = useState<OutreachLocation[]>([])
  const [runs, setRuns] = useState<OutreachRun[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<OutreachLocation | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")

  const [mapLoaded, setMapLoaded] = useState(false)
  const [showAllLocations, setShowAllLocations] = useState(false)
  const [locationsLoading, setLocationsLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Form state for adding/editing locations
  const [formData, setFormData] = useState({
    name: "",
    intersection: "",
    address: "",
    notes: "",
    safety_concerns: "",
  })

  const reviveCenter: OutreachLocation = {
    id: -1,
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
    fetchLocations()
    if (viewMode === "map") {
      fetchRuns()
    }
  }, [viewMode])

  useEffect(() => {
    if (viewMode === "map") {
      loadMap()
    }
  }, [viewMode])

  useEffect(() => {
    if (mapLoaded && viewMode === "map") {
      updateMapMarkers()
    }
  }, [mapLoaded, locations, runs, showAllLocations])

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/outreach/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRuns = async () => {
    try {
      const response = await fetch("/api/outreach/runs")
      if (response.ok) {
        const data = await response.json()
        setRuns(data)
      }
    } catch (error) {
      console.error("Error fetching runs:", error)
    }
  }

  const loadMap = async () => {
    if (typeof window === "undefined") return

    try {
      const L = (await import("leaflet")).default

      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      await new Promise((resolve) => {
        link.onload = resolve
        setTimeout(resolve, 1000)
      })

      if (mapRef.current && !mapInstanceRef.current) {
        mapRef.current.style.height = "500px"
        mapRef.current.style.width = "100%"

        const map = L.map(mapRef.current).setView([reviveCenter.latitude!, reviveCenter.longitude!], 14)

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
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

    markersRef.current.forEach((marker) => mapInstanceRef.current.removeLayer(marker))
    markersRef.current = []

    // Add Revive Center marker
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

    reviveMarker.bindPopup(`
      <div class="p-3 min-w-[220px]">
        <h3 class="font-semibold text-base mb-2">${reviveCenter.name}</h3>
        <p class="text-sm text-gray-600 mb-3">${reviveCenter.address}</p>
        <div class="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
          <p class="text-purple-800 text-xs font-medium">🏠 Revive Center</p>
          <p class="text-purple-700 text-xs mt-1">Main outreach coordination hub</p>
        </div>
      </div>
    `)

    markersRef.current.push(reviveMarker)

    // Add location markers if showing all locations
    if (showAllLocations) {
      locations.forEach((location) => {
        if (!location.latitude || !location.longitude) return

        const markerIcon = L.divIcon({
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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
                  ${location.visit_count || ""}
                </div>
              </div>
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
            </div>
          </div>
        `

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: "custom-popup",
        })

        marker.on("click", () => setSelectedLocation(location))

        markersRef.current.push(marker)
      })
    }
  }

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/outreach/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchLocations()
        setShowAddDialog(false)
        setFormData({ name: "", intersection: "", address: "", notes: "", safety_concerns: "" })
      }
    } catch (error) {
      console.error("Error adding location:", error)
    }
  }

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocation) return

    try {
      const response = await fetch(`/api/outreach/locations/${selectedLocation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchLocations()
        setShowEditDialog(false)
        setSelectedLocation(null)
      }
    } catch (error) {
      console.error("Error updating location:", error)
    }
  }

  const toggleLocationStatus = async (location: OutreachLocation) => {
    try {
      const response = await fetch(`/api/outreach/locations/${location.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !location.is_active }),
      })

      if (response.ok) {
        await fetchLocations()
      }
    } catch (error) {
      console.error("Error toggling location status:", error)
    }
  }

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.intersection.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openEditDialog = (location: OutreachLocation) => {
    setSelectedLocation(location)
    setFormData({
      name: location.name,
      intersection: location.intersection,
      address: location.address || "",
      notes: location.notes || "",
      safety_concerns: location.safety_concerns || "",
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (location: OutreachLocation) => {
    setSelectedLocation(location)
    setShowViewDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Outreach Locations</h2>
          <p className="text-gray-600">Manage and track all outreach locations</p>
        </div>

        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as "list" | "map")}
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map view">
              <Map className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Map</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Downtown Encampment"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="intersection">Intersection/Address</Label>
                  <Input
                    id="intersection"
                    value={formData.intersection}
                    onChange={(e) => setFormData({ ...formData, intersection: e.target.value })}
                    placeholder="e.g., Michigan Ave & Erie St"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Full Address (Optional)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="General notes about this location"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="safety_concerns">Safety Concerns</Label>
                  <Textarea
                    id="safety_concerns"
                    value={formData.safety_concerns}
                    onChange={(e) => setFormData({ ...formData, safety_concerns: e.target.value })}
                    placeholder="Any safety concerns or precautions"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Add Location
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Locations</p>
                    <p className="text-2xl font-bold">{locations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Locations</p>
                    <p className="text-2xl font-bold">{locations.filter((l) => l.is_active).length}</p>
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
                    <p className="text-sm text-gray-600">Safety Concerns</p>
                    <p className="text-2xl font-bold">{locations.filter((l) => l.safety_concerns).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Locations List */}
          <div className="space-y-4">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
                        <Badge variant={location.is_active ? "default" : "secondary"}>
                          {location.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {location.safety_concerns && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Safety
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{location.intersection}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {location.last_visited
                            ? new Date(location.last_visited).toLocaleDateString()
                            : "Never visited"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {location.visit_count} visits
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openViewDialog(location)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(location)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredLocations.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "No locations match your search."
                      : "Get started by adding your first outreach location."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <p className="text-gray-600">Interactive map of outreach locations</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showAllLocations ? "outline" : "default"}
                onClick={() => {
                  setShowAllLocations(!showAllLocations)
                  if (!showAllLocations) {
                    setLocationsLoading(true)
                    setTimeout(() => setLocationsLoading(false), 1000)
                  }
                }}
                className="flex items-center gap-2"
                disabled={locationsLoading}
              >
                <MapPin className="h-4 w-4" />
                {locationsLoading ? "Loading..." : showAllLocations ? "Show Revive Center Only" : "Load All Locations"}
              </Button>
            </div>
          </div>

          {/* Map Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Locations</p>
                    <p className="text-lg font-bold">{locations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active Locations</p>
                    <p className="text-lg font-bold">{locations.filter((l) => l.is_active).length}</p>
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
                    <p className="text-xs text-gray-600">Total Visits</p>
                    <p className="text-lg font-bold">{locations.reduce((sum, loc) => sum + loc.visit_count, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Safety Alerts</p>
                    <p className="text-lg font-bold">{locations.filter((l) => l.safety_concerns).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
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

              {/* Map Styles */}
              <style jsx global>{`
                .custom-tooltip {
                  background: rgba(30, 41, 59, 0.95) !important;
                  border: 2px solid rgba(255, 255, 255, 0.2) !important;
                  border-radius: 8px !important;
                  color: #f1f5f9 !important;
                  font-size: 13px !important;
                  padding: 10px 12px !important;
                  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
                  font-weight: 500 !important;
                  backdrop-filter: blur(8px) !important;
                }
                
                .custom-popup .leaflet-popup-content-wrapper {
                  border-radius: 12px !important;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
                  background: white !important;
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
              `}</style>
            </CardContent>
          </Card>

          {/* Map Legend */}
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
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md transform rotate-45"
                        style={{ borderRadius: "50% 50% 50% 0" }}
                      ></div>
                      <span>Outreach Locations</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Tips</h4>
                  <div className="text-xs text-gray-600">
                    <strong>💡 Tip:</strong> Click pins for detailed location information
                  </div>
                  {!showAllLocations && (
                    <div className="text-xs text-blue-600">
                      <strong>🚀 Performance:</strong> Click "Load All Locations" to see outreach data
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditLocation} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Location Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-intersection">Intersection/Address</Label>
              <Input
                id="edit-intersection"
                value={formData.intersection}
                onChange={(e) => setFormData({ ...formData, intersection: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Full Address (Optional)</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-safety">Safety Concerns</Label>
              <Textarea
                id="edit-safety"
                value={formData.safety_concerns}
                onChange={(e) => setFormData({ ...formData, safety_concerns: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Location
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Details</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Name</Label>
                <p className="text-sm text-gray-900">{selectedLocation.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Intersection</Label>
                <p className="text-sm text-gray-900">{selectedLocation.intersection}</p>
              </div>
              {selectedLocation.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <p className="text-sm text-gray-900">{selectedLocation.address}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedLocation.is_active ? "default" : "secondary"}>
                    {selectedLocation.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleLocationStatus(selectedLocation)}>
                    {selectedLocation.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Visit Statistics</Label>
                <div className="text-sm text-gray-900 space-y-1">
                  <p>Total visits: {selectedLocation.visit_count}</p>
                  <p>
                    Last visited:{" "}
                    {selectedLocation.last_visited
                      ? new Date(selectedLocation.last_visited).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>
              {selectedLocation.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLocation.notes}</p>
                </div>
              )}
              {selectedLocation.safety_concerns && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Safety Concerns</Label>
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800 whitespace-pre-wrap">{selectedLocation.safety_concerns}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => openEditDialog(selectedLocation)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Location
                </Button>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
