"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Users, MessageSquare, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OutreachCampaign {
  id: number
  name: string
  target_audience: string
  message: string
  status: "draft" | "active" | "completed"
  created_date: string
  contacts_reached: number
  responses: number
}

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state for new campaign
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    target_audience: "",
    message: "",
    status: "draft" as const,
  })

  useEffect(() => {
    // Simulate loading campaigns - in real app this would fetch from API
    setTimeout(() => {
      setCampaigns([
        {
          id: 1,
          name: "Housing Support Outreach",
          target_audience: "Clients needing housing assistance",
          message: "We have new housing resources available. Contact us to learn more.",
          status: "active",
          created_date: "2024-01-15",
          contacts_reached: 45,
          responses: 12,
        },
        {
          id: 2,
          name: "Mental Health Check-in",
          target_audience: "Clients with mental health services",
          message: "How are you doing? We're here to support your mental health journey.",
          status: "completed",
          created_date: "2024-01-10",
          contacts_reached: 78,
          responses: 23,
        },
        {
          id: 3,
          name: "Job Training Program",
          target_audience: "Clients seeking employment",
          message: "New job training opportunities are available. Join our program today!",
          status: "draft",
          created_date: "2024-01-20",
          contacts_reached: 0,
          responses: 0,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.target_audience || !newCampaign.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const campaign: OutreachCampaign = {
      id: campaigns.length + 1,
      ...newCampaign,
      created_date: new Date().toISOString().split("T")[0],
      contacts_reached: 0,
      responses: 0,
    }

    setCampaigns([campaign, ...campaigns])
    setNewCampaign({
      name: "",
      target_audience: "",
      message: "",
      status: "draft",
    })
    setIsCreateDialogOpen(false)

    toast({
      title: "Success",
      description: "Outreach campaign created successfully",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateResponseRate = (responses: number, reached: number) => {
    if (reached === 0) return 0
    return Math.round((responses / reached) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading outreach campaigns...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Outreach Campaigns</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    value={newCampaign.target_audience}
                    onChange={(e) => setNewCampaign({ ...newCampaign, target_audience: e.target.value })}
                    placeholder="Describe your target audience"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newCampaign.message}
                    onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                    placeholder="Enter your outreach message"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newCampaign.status}
                    onValueChange={(value: "draft" | "active" | "completed") =>
                      setNewCampaign({ ...newCampaign, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign}>Create Campaign</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.filter((c) => c.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reached</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.contacts_reached, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.responses, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created: {new Date(campaign.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Target Audience</h4>
                    <p className="text-sm text-muted-foreground">{campaign.target_audience}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Message</h4>
                    <p className="text-sm text-muted-foreground">{campaign.message}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{campaign.contacts_reached}</div>
                      <div className="text-sm text-muted-foreground">Contacts Reached</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{campaign.responses}</div>
                      <div className="text-sm text-muted-foreground">Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculateResponseRate(campaign.responses, campaign.contacts_reached)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Response Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first outreach campaign to start connecting with clients.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
