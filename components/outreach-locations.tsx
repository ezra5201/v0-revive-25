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
import { MapPin, Plus, Edit, Eye, AlertTriangle, Calendar, Users } from "lucide-react"

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

export function OutreachLocations() {
  const [locations, setLocations] = useState<OutreachLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<OutreachLocation | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  // Form state for adding/editing locations
  const [formData, setFormData] = useState({
    name: "",
    intersection: "",
    address: "",
    notes: "",
    safety_concerns: "",
  })

  useEffect(() => {
    fetchLocations()
  }, [])

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
                      {location.last_visited ? new Date(location.last_visited).toLocaleDateString() : "Never visited"}
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
                {searchTerm ? "No locations match your search." : "Get started by adding your first outreach location."}
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
