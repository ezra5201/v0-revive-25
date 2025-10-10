"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, UserPlus, Edit, Power, AlertCircle, Database, Settings, FileText } from "lucide-react"
import { toast } from "sonner"
import {
  type User,
  type RoleTemplate,
  ROLE_TEMPLATES,
  getDefaultPermissions,
  getRoleFromPermissions,
  getPermissionSummary,
} from "@/lib/user-roles"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleTemplate>("Direct Service Provider")
  const [permissions, setPermissions] = useState(getDefaultPermissions())

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = (role: RoleTemplate) => {
    setSelectedRole(role)
    if (role === "Custom") {
      setPermissions(getDefaultPermissions())
    } else {
      const template = ROLE_TEMPLATES[role]
      setPermissions({ ...getDefaultPermissions(), ...template })
    }
  }

  const handlePermissionChange = (key: keyof typeof permissions, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: value }))
    setSelectedRole("Custom")
  }

  const handleAddUser = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    const hasPermission = Object.values(permissions).some((p) => p === true)
    if (!hasPermission) {
      toast.error("At least one permission must be enabled")
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...permissions }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast.success(`User ${email} created successfully`)
      setAddDialogOpen(false)
      setEmail("")
      setSelectedRole("Direct Service Provider")
      setPermissions(getDefaultPermissions())
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      toast.success(`User ${selectedUser.email} updated successfully`)
      setEditDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user")
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user status")
      }

      toast.success(`User ${user.active ? "deactivated" : "activated"} successfully`)
      setDeactivateDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user status")
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setPermissions({
      can_view_client_demographics: user.can_view_client_demographics,
      can_view_client_services: user.can_view_client_services,
      can_view_all_clients: user.can_view_all_clients,
      can_export_client_data: user.can_export_client_data,
      can_manage_users: user.can_manage_users,
      can_manage_system_settings: user.can_manage_system_settings,
      can_view_audit_logs: user.can_view_audit_logs,
      can_manage_database: user.can_manage_database,
      can_create_contacts: user.can_create_contacts,
      can_edit_own_contacts: user.can_edit_own_contacts,
      can_edit_all_contacts: user.can_edit_all_contacts,
      can_delete_contacts: user.can_delete_contacts,
    })
    setSelectedRole(getRoleFromPermissions(permissions))
    setEditDialogOpen(true)
  }

  const openDeactivateDialog = (user: User) => {
    setSelectedUser(user)
    setDeactivateDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              </div>
              <p className="text-gray-600">Manage user permissions and access control</p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} className="min-h-[44px]">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("users") && (
                <div className="mt-2">
                  <p className="text-sm">
                    The users table may not exist. Please run the SQL script:{" "}
                    <code className="bg-red-100 px-1 rounded">scripts/create-users-table.sql</code>
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {users.length} {users.length === 1 ? "user" : "users"} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {error ? "Unable to load users" : "No users found. Add your first user to get started."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const role = getRoleFromPermissions(user)
                      const summary = getPermissionSummary(user)

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.active ? "default" : "secondary"}>
                              {user.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {summary.slice(0, 3).map((perm) => (
                                <Badge key={perm} variant="secondary" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                              {summary.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{summary.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="min-h-[36px]"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant={user.active ? "destructive" : "default"}
                                size="sm"
                                onClick={() => openDeactivateDialog(user)}
                                className="min-h-[36px]"
                              >
                                <Power className="h-4 w-4 mr-1" />
                                {user.active ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with specific permissions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role Template</label>
              <Select value={selectedRole} onValueChange={(value) => handleRoleChange(value as RoleTemplate)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct Service Provider">Direct Service Provider</SelectItem>
                  <SelectItem value="Program Director">Program Director</SelectItem>
                  <SelectItem value="Reports Viewer">Reports Viewer (Board/Funders)</SelectItem>
                  <SelectItem value="IT Administrator">IT Administrator (No PHI Access)</SelectItem>
                  <SelectItem value="Data Manager">Data Manager</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {selectedRole !== "Custom" && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-900 mb-2">Included Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {getPermissionSummary(permissions).map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="permissions">
                <AccordionTrigger>
                  <span className="text-sm font-medium">Advanced: Customize Permissions</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Data Access Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium">Data Access</h4>
                      </div>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_view_client_demographics"
                            checked={permissions.can_view_client_demographics}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_view_client_demographics", checked as boolean)
                            }
                          />
                          <label htmlFor="can_view_client_demographics" className="text-sm cursor-pointer">
                            View Client Demographics
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_view_client_services"
                            checked={permissions.can_view_client_services}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_view_client_services", checked as boolean)
                            }
                          />
                          <label htmlFor="can_view_client_services" className="text-sm cursor-pointer">
                            View Client Services
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_view_all_clients"
                            checked={permissions.can_view_all_clients}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_view_all_clients", checked as boolean)
                            }
                          />
                          <label htmlFor="can_view_all_clients" className="text-sm cursor-pointer">
                            View All Clients
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_export_client_data"
                            checked={permissions.can_export_client_data}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_export_client_data", checked as boolean)
                            }
                          />
                          <label htmlFor="can_export_client_data" className="text-sm cursor-pointer">
                            Export Client Data
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* System Management Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium">System Management</h4>
                      </div>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_manage_users"
                            checked={permissions.can_manage_users}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_manage_users", checked as boolean)
                            }
                          />
                          <label htmlFor="can_manage_users" className="text-sm cursor-pointer">
                            Manage Users
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_manage_system_settings"
                            checked={permissions.can_manage_system_settings}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_manage_system_settings", checked as boolean)
                            }
                          />
                          <label htmlFor="can_manage_system_settings" className="text-sm cursor-pointer">
                            Manage System Settings
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_view_audit_logs"
                            checked={permissions.can_view_audit_logs}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_view_audit_logs", checked as boolean)
                            }
                          />
                          <label htmlFor="can_view_audit_logs" className="text-sm cursor-pointer">
                            View Audit Logs
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_manage_database"
                            checked={permissions.can_manage_database}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_manage_database", checked as boolean)
                            }
                          />
                          <label htmlFor="can_manage_database" className="text-sm cursor-pointer">
                            Manage Database
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Operations Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium">Operations</h4>
                      </div>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_create_contacts"
                            checked={permissions.can_create_contacts}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_create_contacts", checked as boolean)
                            }
                          />
                          <label htmlFor="can_create_contacts" className="text-sm cursor-pointer">
                            Create Contacts
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_edit_own_contacts"
                            checked={permissions.can_edit_own_contacts}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_edit_own_contacts", checked as boolean)
                            }
                          />
                          <label htmlFor="can_edit_own_contacts" className="text-sm cursor-pointer">
                            Edit Own Contacts
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_edit_all_contacts"
                            checked={permissions.can_edit_all_contacts}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_edit_all_contacts", checked as boolean)
                            }
                          />
                          <label htmlFor="can_edit_all_contacts" className="text-sm cursor-pointer">
                            Edit All Contacts
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="can_delete_contacts"
                            checked={permissions.can_delete_contacts}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("can_delete_contacts", checked as boolean)
                            }
                          />
                          <label htmlFor="can_delete_contacts" className="text-sm cursor-pointer">
                            Delete Contacts
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>Update permissions for {selectedUser?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Role</label>
              <Badge variant="outline" className="text-sm">
                {getRoleFromPermissions(permissions)}
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Data Access Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Data Access</h4>
                </div>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_view_client_demographics"
                      checked={permissions.can_view_client_demographics}
                      onCheckedChange={(checked) =>
                        handlePermissionChange("can_view_client_demographics", checked as boolean)
                      }
                    />
                    <label htmlFor="edit_can_view_client_demographics" className="text-sm cursor-pointer">
                      View Client Demographics
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_view_client_services"
                      checked={permissions.can_view_client_services}
                      onCheckedChange={(checked) =>
                        handlePermissionChange("can_view_client_services", checked as boolean)
                      }
                    />
                    <label htmlFor="edit_can_view_client_services" className="text-sm cursor-pointer">
                      View Client Services
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_view_all_clients"
                      checked={permissions.can_view_all_clients}
                      onCheckedChange={(checked) => handlePermissionChange("can_view_all_clients", checked as boolean)}
                    />
                    <label htmlFor="edit_can_view_all_clients" className="text-sm cursor-pointer">
                      View All Clients
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_export_client_data"
                      checked={permissions.can_export_client_data}
                      onCheckedChange={(checked) =>
                        handlePermissionChange("can_export_client_data", checked as boolean)
                      }
                    />
                    <label htmlFor="edit_can_export_client_data" className="text-sm cursor-pointer">
                      Export Client Data
                    </label>
                  </div>
                </div>
              </div>

              {/* System Management Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">System Management</h4>
                </div>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_manage_users"
                      checked={permissions.can_manage_users}
                      onCheckedChange={(checked) => handlePermissionChange("can_manage_users", checked as boolean)}
                    />
                    <label htmlFor="edit_can_manage_users" className="text-sm cursor-pointer">
                      Manage Users
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_manage_system_settings"
                      checked={permissions.can_manage_system_settings}
                      onCheckedChange={(checked) =>
                        handlePermissionChange("can_manage_system_settings", checked as boolean)
                      }
                    />
                    <label htmlFor="edit_can_manage_system_settings" className="text-sm cursor-pointer">
                      Manage System Settings
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_view_audit_logs"
                      checked={permissions.can_view_audit_logs}
                      onCheckedChange={(checked) => handlePermissionChange("can_view_audit_logs", checked as boolean)}
                    />
                    <label htmlFor="edit_can_view_audit_logs" className="text-sm cursor-pointer">
                      View Audit Logs
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_manage_database"
                      checked={permissions.can_manage_database}
                      onCheckedChange={(checked) => handlePermissionChange("can_manage_database", checked as boolean)}
                    />
                    <label htmlFor="edit_can_manage_database" className="text-sm cursor-pointer">
                      Manage Database
                    </label>
                  </div>
                </div>
              </div>

              {/* Operations Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Operations</h4>
                </div>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_create_contacts"
                      checked={permissions.can_create_contacts}
                      onCheckedChange={(checked) => handlePermissionChange("can_create_contacts", checked as boolean)}
                    />
                    <label htmlFor="edit_can_create_contacts" className="text-sm cursor-pointer">
                      Create Contacts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_edit_own_contacts"
                      checked={permissions.can_edit_own_contacts}
                      onCheckedChange={(checked) => handlePermissionChange("can_edit_own_contacts", checked as boolean)}
                    />
                    <label htmlFor="edit_can_edit_own_contacts" className="text-sm cursor-pointer">
                      Edit Own Contacts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_edit_all_contacts"
                      checked={permissions.can_edit_all_contacts}
                      onCheckedChange={(checked) => handlePermissionChange("can_edit_all_contacts", checked as boolean)}
                    />
                    <label htmlFor="edit_can_edit_all_contacts" className="text-sm cursor-pointer">
                      Edit All Contacts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_can_delete_contacts"
                      checked={permissions.can_delete_contacts}
                      onCheckedChange={(checked) => handlePermissionChange("can_delete_contacts", checked as boolean)}
                    />
                    <label htmlFor="edit_can_delete_contacts" className="text-sm cursor-pointer">
                      Delete Contacts
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate/Activate Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.active ? "Deactivate" : "Activate"} User</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedUser?.active ? "deactivate" : "activate"}{" "}
              <strong>{selectedUser?.email}</strong>?
              {selectedUser?.active && (
                <span className="block mt-2 text-orange-600">
                  This user will no longer be able to access the system.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.active ? "destructive" : "default"}
              onClick={() => selectedUser && handleToggleActive(selectedUser)}
            >
              {selectedUser?.active ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
