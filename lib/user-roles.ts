// Role template definitions for user management
export interface UserPermissions {
  // Data Access
  can_view_client_demographics: boolean
  can_view_client_services: boolean
  can_view_all_clients: boolean
  can_export_client_data: boolean

  // System Management
  can_manage_users: boolean
  can_manage_system_settings: boolean
  can_view_audit_logs: boolean
  can_manage_database: boolean

  // Operations
  can_create_contacts: boolean
  can_edit_own_contacts: boolean
  can_edit_all_contacts: boolean
  can_delete_contacts: boolean
}

export interface User extends UserPermissions {
  id: number
  email: string
  active: boolean
  created_at: string
  updated_at?: string
}

export type RoleTemplate =
  | "Direct Service Provider"
  | "Program Director"
  | "Reports Viewer"
  | "IT Administrator"
  | "Data Manager"
  | "Super Admin"
  | "Custom"

export const ROLE_TEMPLATES: Record<RoleTemplate, Partial<UserPermissions>> = {
  "Direct Service Provider": {
    can_view_client_demographics: true,
    can_view_client_services: true,
    can_create_contacts: true,
    can_edit_own_contacts: true,
    can_view_all_clients: false,
    can_export_client_data: false,
    can_manage_users: false,
    can_manage_system_settings: false,
    can_view_audit_logs: false,
    can_manage_database: false,
    can_edit_all_contacts: false,
    can_delete_contacts: false,
  },
  "Program Director": {
    can_view_client_demographics: true,
    can_view_client_services: true,
    can_view_all_clients: true,
    can_export_client_data: true,
    can_view_audit_logs: true,
    can_create_contacts: true,
    can_edit_own_contacts: true,
    can_edit_all_contacts: true,
    can_delete_contacts: true,
    can_manage_users: false,
    can_manage_system_settings: false,
    can_manage_database: false,
  },
  "Reports Viewer": {
    can_view_client_services: true,
    can_view_client_demographics: false,
    can_view_all_clients: false,
    can_export_client_data: false,
    can_manage_users: false,
    can_manage_system_settings: false,
    can_view_audit_logs: false,
    can_manage_database: false,
    can_create_contacts: false,
    can_edit_own_contacts: false,
    can_edit_all_contacts: false,
    can_delete_contacts: false,
  },
  "IT Administrator": {
    can_manage_users: true,
    can_manage_system_settings: true,
    can_view_audit_logs: true,
    can_manage_database: true,
    can_view_client_demographics: false,
    can_view_client_services: false,
    can_view_all_clients: false,
    can_export_client_data: false,
    can_create_contacts: false,
    can_edit_own_contacts: false,
    can_edit_all_contacts: false,
    can_delete_contacts: false,
  },
  "Data Manager": {
    can_view_client_demographics: true,
    can_view_client_services: true,
    can_view_all_clients: true,
    can_export_client_data: true,
    can_view_audit_logs: true,
    can_create_contacts: true,
    can_edit_own_contacts: true,
    can_edit_all_contacts: true,
    can_delete_contacts: false,
    can_manage_users: false,
    can_manage_system_settings: false,
    can_manage_database: false,
  },
  "Super Admin": {
    can_view_client_demographics: true,
    can_view_client_services: true,
    can_view_all_clients: true,
    can_export_client_data: true,
    can_manage_users: true,
    can_manage_system_settings: true,
    can_view_audit_logs: true,
    can_manage_database: true,
    can_create_contacts: true,
    can_edit_own_contacts: true,
    can_edit_all_contacts: true,
    can_delete_contacts: true,
  },
  Custom: {},
}

export function getDefaultPermissions(): UserPermissions {
  return {
    can_view_client_demographics: false,
    can_view_client_services: false,
    can_view_all_clients: false,
    can_export_client_data: false,
    can_manage_users: false,
    can_manage_system_settings: false,
    can_view_audit_logs: false,
    can_manage_database: false,
    can_create_contacts: false,
    can_edit_own_contacts: false,
    can_edit_all_contacts: false,
    can_delete_contacts: false,
  }
}

export function getRoleFromPermissions(permissions: UserPermissions): RoleTemplate {
  for (const [role, template] of Object.entries(ROLE_TEMPLATES)) {
    if (role === "Custom") continue

    const matches = Object.keys(template).every(
      (key) => permissions[key as keyof UserPermissions] === template[key as keyof UserPermissions],
    )

    if (matches) {
      return role as RoleTemplate
    }
  }

  return "Custom"
}

export function getPermissionSummary(permissions: UserPermissions): string[] {
  const summary: string[] = []

  if (permissions.can_view_client_demographics) summary.push("View Demographics")
  if (permissions.can_view_client_services) summary.push("View Services")
  if (permissions.can_view_all_clients) summary.push("View All Clients")
  if (permissions.can_export_client_data) summary.push("Export Data")
  if (permissions.can_manage_users) summary.push("Manage Users")
  if (permissions.can_manage_system_settings) summary.push("System Settings")
  if (permissions.can_view_audit_logs) summary.push("Audit Logs")
  if (permissions.can_manage_database) summary.push("Database")
  if (permissions.can_create_contacts) summary.push("Create Contacts")
  if (permissions.can_edit_own_contacts) summary.push("Edit Own")
  if (permissions.can_edit_all_contacts) summary.push("Edit All")
  if (permissions.can_delete_contacts) summary.push("Delete")

  return summary
}
