"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Package, Plus, Edit, TrendingDown, TrendingUp, ShoppingCart, CheckCircle } from "lucide-react"

interface InventoryItem {
  id: number
  item_name: string
  category: string
  current_stock: number
  minimum_threshold: number
  unit_type: string
  cost_per_unit?: number
  supplier?: string
  last_restocked?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface InventoryAlert {
  id: number
  inventory_item_id: number
  alert_type: string
  alert_message: string
  is_resolved: boolean
  created_at: string
  item_name?: string
}

const CATEGORIES = ["medical", "food", "hygiene", "clothing", "supplies", "transportation", "shelter", "assistance"]

export function OutreachInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Form state
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    current_stock: 0,
    minimum_threshold: 10,
    unit_type: "",
    cost_per_unit: "",
    supplier: "",
    notes: "",
  })

  const [adjustmentData, setAdjustmentData] = useState({
    adjustment_type: "restock" as "restock" | "usage" | "loss" | "correction",
    quantity: 0,
    notes: "",
  })

  useEffect(() => {
    fetchInventory()
    fetchAlerts()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/outreach/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/outreach/inventory/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/outreach/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost_per_unit: formData.cost_per_unit ? Number.parseFloat(formData.cost_per_unit) : null,
        }),
      })

      if (response.ok) {
        await fetchInventory()
        await fetchAlerts()
        setShowAddDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/outreach/inventory/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost_per_unit: formData.cost_per_unit ? Number.parseFloat(formData.cost_per_unit) : null,
        }),
      })

      if (response.ok) {
        await fetchInventory()
        await fetchAlerts()
        setShowEditDialog(false)
        setSelectedItem(null)
      }
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/outreach/inventory/${selectedItem.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustmentData),
      })

      if (response.ok) {
        await fetchInventory()
        await fetchAlerts()
        setShowAdjustDialog(false)
        setSelectedItem(null)
        setAdjustmentData({ adjustment_type: "restock", quantity: 0, notes: "" })
      }
    } catch (error) {
      console.error("Error adjusting stock:", error)
    }
  }

  const resolveAlert = async (alertId: number) => {
    try {
      const response = await fetch(`/api/outreach/inventory/alerts/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_resolved: true }),
      })

      if (response.ok) {
        await fetchAlerts()
      }
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      item_name: "",
      category: "",
      current_stock: 0,
      minimum_threshold: 10,
      unit_type: "",
      cost_per_unit: "",
      supplier: "",
      notes: "",
    })
  }

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      item_name: item.item_name,
      category: item.category,
      current_stock: item.current_stock,
      minimum_threshold: item.minimum_threshold,
      unit_type: item.unit_type,
      cost_per_unit: item.cost_per_unit?.toString() || "",
      supplier: item.supplier || "",
      notes: item.notes || "",
    })
    setShowEditDialog(true)
  }

  const openAdjustDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustmentData({ adjustment_type: "restock", quantity: 0, notes: "" })
    setShowAdjustDialog(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) return "out_of_stock"
    if (item.current_stock <= item.minimum_threshold) return "low_stock"
    return "in_stock"
  }

  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item)
    switch (status) {
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "low_stock":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Low Stock
          </Badge>
        )
      default:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            In Stock
          </Badge>
        )
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const statusFilter =
      filter === "all" ||
      (filter === "low_stock" && item.current_stock <= item.minimum_threshold && item.current_stock > 0) ||
      (filter === "out_of_stock" && item.current_stock === 0)

    const catFilter = categoryFilter === "all" || item.category === categoryFilter

    return statusFilter && catFilter && item.is_active
  })

  const lowStockItems = inventory.filter(
    (item) => item.current_stock <= item.minimum_threshold && item.current_stock > 0,
  )
  const outOfStockItems = inventory.filter((item) => item.current_stock === 0)
  const unresolvedAlerts = alerts.filter((alert) => !alert.is_resolved)

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
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Track supplies and manage stock levels</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g., Narcan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="unit_type">Unit Type</Label>
                  <Input
                    id="unit_type"
                    value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                    placeholder="e.g., pieces, boxes"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: Number.parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_threshold">Minimum Threshold</Label>
                  <Input
                    id="minimum_threshold"
                    type="number"
                    min="0"
                    value={formData.minimum_threshold}
                    onChange={(e) =>
                      setFormData({ ...formData, minimum_threshold: Number.parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this item"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Add Item
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts Section */}
      {unresolvedAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unresolvedAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.item_name}</p>
                  <p className="text-xs text-gray-600">{alert.alert_message}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {unresolvedAlerts.length > 3 && (
              <p className="text-sm text-orange-700 text-center">+{unresolvedAlerts.length - 3} more alerts</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{inventory.filter((i) => i.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Need Reorder</p>
                <p className="text-2xl font-bold">{lowStockItems.length + outOfStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All Items" },
            { key: "low_stock", label: "Low Stock" },
            { key: "out_of_stock", label: "Out of Stock" },
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

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{item.item_name}</h3>
                    {getStockBadge(item)}
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Current Stock:</span>
                      <span className="font-medium">
                        {item.current_stock} {item.unit_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Minimum Threshold:</span>
                      <span>
                        {item.minimum_threshold} {item.unit_type}
                      </span>
                    </div>
                    {item.supplier && (
                      <div className="flex items-center justify-between">
                        <span>Supplier:</span>
                        <span>{item.supplier}</span>
                      </div>
                    )}
                    {item.last_restocked && (
                      <div className="flex items-center justify-between">
                        <span>Last Restocked:</span>
                        <span>{new Date(item.last_restocked).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Stock Level</span>
                      <span>
                        {Math.round(
                          (item.current_stock / Math.max(item.minimum_threshold * 2, item.current_stock)) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.current_stock === 0
                            ? "bg-red-500"
                            : item.current_stock <= item.minimum_threshold
                              ? "bg-orange-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (item.current_stock / Math.max(item.minimum_threshold * 2, item.current_stock)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openAdjustDialog(item)}>
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInventory.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">
                {filter === "all" ? "No inventory items found." : `No ${filter.replace("_", " ")} items found.`}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditItem} className="space-y-4">
            {/* Same form fields as add dialog */}
            <div>
              <Label htmlFor="edit_item_name">Item Name</Label>
              <Input
                id="edit_item_name"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_unit_type">Unit Type</Label>
                <Input
                  id="edit_unit_type"
                  value={formData.unit_type}
                  onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_current_stock">Current Stock</Label>
                <Input
                  id="edit_current_stock"
                  type="number"
                  min="0"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_minimum_threshold">Minimum Threshold</Label>
                <Input
                  id="edit_minimum_threshold"
                  type="number"
                  min="0"
                  value={formData.minimum_threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_threshold: Number.parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_cost_per_unit">Cost per Unit ($)</Label>
                <Input
                  id="edit_cost_per_unit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit_supplier">Supplier</Label>
                <Input
                  id="edit_supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Item
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedItem?.item_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="text-lg font-semibold">
                {selectedItem?.current_stock} {selectedItem?.unit_type}
              </p>
            </div>

            <div>
              <Label htmlFor="adjustment_type">Adjustment Type</Label>
              <Select
                value={adjustmentData.adjustment_type}
                onValueChange={(value: any) => setAdjustmentData({ ...adjustmentData, adjustment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restock">Restock (Add)</SelectItem>
                  <SelectItem value="usage">Usage (Remove)</SelectItem>
                  <SelectItem value="loss">Loss/Damage (Remove)</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={adjustmentData.quantity}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, quantity: Number.parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="adjustment_notes">Notes</Label>
              <Textarea
                id="adjustment_notes"
                value={adjustmentData.notes}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                placeholder="Reason for adjustment"
                rows={2}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">New Stock Level</p>
              <p className="text-lg font-semibold">
                {adjustmentData.adjustment_type === "restock"
                  ? (selectedItem?.current_stock || 0) + adjustmentData.quantity
                  : adjustmentData.adjustment_type === "correction"
                    ? adjustmentData.quantity
                    : Math.max(0, (selectedItem?.current_stock || 0) - adjustmentData.quantity)}{" "}
                {selectedItem?.unit_type}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Adjust Stock
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAdjustDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
