-- Create audit_logs table for HIPAA compliance tracking
-- This table records all data access and modifications for compliance purposes

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('VIEW', 'CREATE', 'UPDATE', 'DELETE')),
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100),
  client_name VARCHAR(255),
  ip_address INET,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_name ON audit_logs(client_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- Create composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_user ON audit_logs(timestamp DESC, user_email);

COMMENT ON TABLE audit_logs IS 'HIPAA compliance audit trail for all data access and modifications';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: VIEW, CREATE, UPDATE, or DELETE';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object containing before/after values for UPDATE actions';
