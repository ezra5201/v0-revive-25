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
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Calendar,
  Plus,
  Edit,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  List,
  CalendarDays,
} from "lucide-react"

interface OutreachRun {
  id: number
  run_date: string
  run_time?: string
  lead_staff: string
  team_members: string[]
  planned_locations: number[]
  actual_locations: number[]
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  safety_notes?: string
  follow_up_notes?: string
  total_contacts: number
  created_at: string
  updated_at: string
}

interface OutreachLocation {
  id: number
  name: string
  intersection: string
  is_active: boolean
}

export function OutreachRuns() {
  const [runs, setRuns] = useState<OutreachRun[]>([])
  const [locations, setLocations] = useState<OutreachLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedRun, setSelectedRun] = useState<OutreachRun | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [filter, setFilter] = useState<"all" | "upcoming" | "today" | "completed">("upcoming")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const [formData, setFormData] = useState({
    run_date: "",
    run_time: "",
    lead_staff: "",
    team_members: [] as string[],
    planned_locations: [] as number[],
    safety_notes: "",
  })

  const [teamMemberInput, setTeamMemberInput] = useState("")

  useEffect(() => {
    fetchRuns()
    fetchLocations()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await fetch("/api/outreach/runs")
      if (response.ok) {
        const data = await response.json()
        setRuns(data)
      }
    } catch (error) {
      console.error("Error fetching runs:", error)
    } finally {
      setLoading(false)
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

  const handleAddRun = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/outreach/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchRuns()
        setShowAddDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding run:", error)
    }
  }

  const handleEditRun = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRun) return

    try {
      const response = await fetch(`/api/outreach/runs/${selectedRun.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchRuns()
        setShowEditDialog(false)
        setSelectedRun(null)
      }
    } catch (error) {
      console.error("Error updating run:", error)
    }
  }

  const updateRunStatus = async (runId: number, status: OutreachRun["status"]) => {
    try {
      const response = await fetch(`/api/outreach/runs/${runId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchRuns()
      }
    } catch (error) {
      console.error("Error updating run status:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      run_date: "",
      run_time: "",
      lead_staff: "",
      team_members: [],
      planned_locations: [],
      safety_notes: "",
    })
    setTeamMemberInput("")
  }

  const addTeamMember = () => {
    if (teamMemberInput.trim() && !formData.team_members.includes(teamMemberInput.trim())) {
      setFormData({
        ...formData,
        team_members: [...formData.team_members, teamMemberInput.trim()],
      })
      setTeamMemberInput("")
    }
  }

  const removeTeamMember = (member: string) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter((m) => m !== member),
    })
  }

  const toggleLocation = (locationId: number) => {
    const isSelected = formData.planned_locations.includes(locationId)
    setFormData({
      ...formData,
      planned_locations: isSelected
        ? formData.planned_locations.filter((id) => id !== locationId)
        : [...formData.planned_locations, locationId],
    })
  }

  const openEditDialog = (run: OutreachRun) => {
    setSelectedRun(run)
    setFormData({
      run_date: run.run_date,
      run_time: run.run_time || "",
      lead_staff: run.lead_staff,
      team_members: run.team_members,
      planned_locations: run.planned_locations,
      safety_notes: run.safety_notes || "",
    })
    setShowEditDialog(true)
  }

  const getStatusIcon = (status: OutreachRun["status"]) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: OutreachRun["status"]) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "in_progress":
        return "secondary"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
    }
  }

  const filteredRuns = runs.filter((run) => {
    const today = new Date().toISOString().split("T")[0]
    const runDate = run.run_date

    switch (filter) {
      case "today":
        return runDate === today
      case "upcoming":
        return runDate >= today && run.status !== "completed" && run.status !== "cancelled"
      case "completed":
        return run.status === "completed"
      default:
        return true
    }
  })

  const getRunsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return filteredRuns.filter((run) => run.run_date === dateString)
  }

  const hasRunsOnDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return runs.some((run) => run.run_date === dateString)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Outreach Runs</h2>
          <p className="text-gray-600">Schedule and manage outreach runs</p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as "list" | "calendar")}
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view">
              <CalendarDays className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Calendar</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Run
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Run</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRun} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="run_date">Date</Label>
                    <Input
                      id="run_date"
                      type="date"
                      value={formData.run_date}
                      onChange={(e) => setFormData({ ...formData, run_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="run_time">Time</Label>
                    <Input
                      id="run_time"
                      type="time"
                      value={formData.run_time}
                      onChange={(e) => setFormData({ ...formData, run_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lead_staff">Lead Staff</Label>
                  <Input
                    id="lead_staff"
                    value={formData.lead_staff}
                    onChange={(e) => setFormData({ ...formData, lead_staff: e.target.value })}
                    placeholder="Name of run leader"
                    required
                  />
                </div>

                <div>
                  <Label>Team Members</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={teamMemberInput}
                      onChange={(e) => setTeamMemberInput(e.target.value)}
                      placeholder="Add team member"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTeamMember())}
                    />
                    <Button type="button" onClick={addTeamMember} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.team_members.map((member) => (
                      <Badge
                        key={member}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTeamMember(member)}
                      >
                        {member} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Planned Locations</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {locations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.id}`}
                          checked={formData.planned_locations.includes(location.id)}
                          onCheckedChange={() => toggleLocation(location.id)}
                        />
                        <Label htmlFor={`location-${location.id}`} className="text-sm">
                          {location.name} - {location.intersection}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="safety_notes">Safety Notes</Label>
                  <Textarea
                    id="safety_notes"
                    value={formData.safety_notes}
                    onChange={(e) => setFormData({ ...formData, safety_notes: e.target.value })}
                    placeholder="Any safety concerns or precautions for this run"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Schedule Run
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
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: "upcoming", label: "Upcoming" },
              { key: "today", label: "Today" },
              { key: "completed", label: "Completed" },
              { key: "all", label: "All" },
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Runs</p>
                    <p className="text-2xl font-bold">{runs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold">
                      {
                        runs.filter(
                          (r) =>
                            r.run_date >= new Date().toISOString().split("T")[0] &&
                            r.status !== "completed" &&
                            r.status !== "cancelled",
                        ).length
                      }
                    </p>
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
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{runs.filter((r) => r.status === "completed").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Contacts</p>
                    <p className="text-2xl font-bold">{runs.reduce((sum, run) => sum + run.total_contacts, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Runs List */}
          <div className="space-y-4">
            {filteredRuns.map((run) => (
              <Card key={run.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {new Date(run.run_date).toLocaleDateString()}
                          {run.run_time && ` at ${run.run_time}`}
                        </h3>
                        <Badge variant={getStatusColor(run.status)} className="flex items-center gap-1">
                          {getStatusIcon(run.status)}
                          {run.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Lead: {run.lead_staff}
                          {run.team_members.length > 0 && ` (+${run.team_members.length} team members)`}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {run.planned_locations.length} planned locations
                        </p>
                        {run.total_contacts > 0 && (
                          <p className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {run.total_contacts} contacts made
                          </p>
                        )}
                        {run.safety_notes && (
                          <p className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            Safety notes
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {run.status === "scheduled" && (
                        <Button size="sm" onClick={() => updateRunStatus(run.id, "in_progress")}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {run.status === "in_progress" && (
                        <Button size="sm" onClick={() => updateRunStatus(run.id, "completed")}>
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(run)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRuns.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No runs found</h3>
                  <p className="text-gray-600 mb-4">
                    {filter === "upcoming" ? "No upcoming runs scheduled." : `No ${filter} runs found.`}
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Run
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full"
                    modifiers={{
                      hasRuns: (date) => hasRunsOnDate(date),
                    }}
                    modifiersStyles={{
                      hasRuns: {
                        backgroundColor: "rgb(59 130 246)",
                        color: "white",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Selected Date Details */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}
                  </h3>

                  {selectedDate && (
                    <div className="space-y-3">
                      {getRunsForDate(selectedDate).length > 0 ? (
                        getRunsForDate(selectedDate).map((run) => (
                          <div key={run.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusColor(run.status)} className="flex items-center gap-1">
                                  {getStatusIcon(run.status)}
                                  {run.status.replace("_", " ")}
                                </Badge>
                                {run.run_time && <span className="text-sm text-gray-600">{run.run_time}</span>}
                              </div>
                              <Button size="sm" variant="outline" onClick={() => openEditDialog(run)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Lead: {run.lead_staff}</p>
                            <p className="text-sm text-gray-600">{run.planned_locations.length} locations planned</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">No runs scheduled for this date</p>
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                run_date: selectedDate.toISOString().split("T")[0],
                              })
                              setShowAddDialog(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Schedule Run
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calendar Legend */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Legend</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Days with scheduled runs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span>Available days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Run</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRun} className="space-y-4">
            {/* Same form fields as add dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_run_date">Date</Label>
                <Input
                  id="edit_run_date"
                  type="date"
                  value={formData.run_date}
                  onChange={(e) => setFormData({ ...formData, run_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_run_time">Time</Label>
                <Input
                  id="edit_run_time"
                  type="time"
                  value={formData.run_time}
                  onChange={(e) => setFormData({ ...formData, run_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_lead_staff">Lead Staff</Label>
              <Input
                id="edit_lead_staff"
                value={formData.lead_staff}
                onChange={(e) => setFormData({ ...formData, lead_staff: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Team Members</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                  placeholder="Add team member"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTeamMember())}
                />
                <Button type="button" onClick={addTeamMember} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.team_members.map((member) => (
                  <Badge
                    key={member}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTeamMember(member)}
                  >
                    {member} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Planned Locations</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-location-${location.id}`}
                      checked={formData.planned_locations.includes(location.id)}
                      onCheckedChange={() => toggleLocation(location.id)}
                    />
                    <Label htmlFor={`edit-location-${location.id}`} className="text-sm">
                      {location.name} - {location.intersection}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="edit_safety_notes">Safety Notes</Label>
              <Textarea
                id="edit_safety_notes"
                value={formData.safety_notes}
                onChange={(e) => setFormData({ ...formData, safety_notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Run
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
