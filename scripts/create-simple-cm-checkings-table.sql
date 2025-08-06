-- Simple CM Checkings table for prototype
-- This stores all form data as JSON plus key fields for querying

CREATE TABLE IF NOT EXISTS cm_checkings (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  cm_provider_name VARCHAR(255) NOT NULL,
  followup_date DATE NOT NULL,
  meeting_type VARCHAR(50) NOT NULL,
  current_status VARCHAR(50) NOT NULL,
  contact_summary TEXT NOT NULL,
  client_tasks TEXT NOT NULL,
  cm_tasks TEXT NOT NULL,
  form_data JSONB NOT NULL, -- Store all form data as JSON
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' or 'submitted'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simple indexes
CREATE INDEX IF NOT EXISTS idx_cm_checkings_client_name ON cm_checkings(client_name);
CREATE INDEX IF NOT EXISTS idx_cm_checkings_followup_date ON cm_checkings(followup_date);
CREATE INDEX IF NOT EXISTS idx_cm_checkings_status ON cm_checkings(status);

-- Update trigger
CREATE OR REPLACE FUNCTION update_cm_checkings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cm_checkings_updated_at
    BEFORE UPDATE ON cm_checkings
    FOR EACH ROW
    EXECUTE FUNCTION update_cm_checkings_updated_at();
