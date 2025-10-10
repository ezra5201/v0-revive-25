-- Add soft delete columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255) DEFAULT NULL;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_clients_soft_deleted ON clients(soft_deleted);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);

-- Update existing clients to have soft_deleted = false
UPDATE clients SET soft_deleted = false WHERE soft_deleted IS NULL;

COMMENT ON COLUMN clients.soft_deleted IS 'Marks client as soft deleted for potential recovery';
COMMENT ON COLUMN clients.deleted_at IS 'Timestamp when client was marked as deleted';
COMMENT ON COLUMN clients.deleted_by IS 'Email of user who deleted the client';
