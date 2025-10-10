-- Create users table for permission-based access control
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  
  -- Data Access Permissions
  can_view_client_demographics BOOLEAN DEFAULT false,
  can_view_client_services BOOLEAN DEFAULT false,
  can_view_all_clients BOOLEAN DEFAULT false,
  can_export_client_data BOOLEAN DEFAULT false,
  
  -- System Management Permissions
  can_manage_users BOOLEAN DEFAULT false,
  can_manage_system_settings BOOLEAN DEFAULT false,
  can_view_audit_logs BOOLEAN DEFAULT false,
  can_manage_database BOOLEAN DEFAULT false,
  
  -- Operational Permissions
  can_create_contacts BOOLEAN DEFAULT false,
  can_edit_own_contacts BOOLEAN DEFAULT false,
  can_edit_all_contacts BOOLEAN DEFAULT false,
  can_delete_contacts BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on active status for filtering
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
