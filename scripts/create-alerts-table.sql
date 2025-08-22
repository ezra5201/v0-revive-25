-- Migration script to create alerts table and indexes
-- Run this once during deployment/setup

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id            SERIAL PRIMARY KEY,
  contact_id    INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  client_name   VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  alert_type    VARCHAR(50)  DEFAULT 'behavioral',
  alert_details TEXT         NOT NULL,
  severity      VARCHAR(20)  DEFAULT 'medium',
  status        VARCHAR(20)  DEFAULT 'active',
  resolved_by   VARCHAR(255),
  resolved_at   TIMESTAMP,
  expires_at    DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_status      ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_client      ON alerts(client_name);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at  ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_contact_id  ON alerts(contact_id);
CREATE INDEX IF NOT EXISTS idx_alerts_expires_at  ON alerts(expires_at);

-- Add alert_id column to contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS alert_id INTEGER REFERENCES alerts(id);

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_contacts_alert_id ON contacts(alert_id);
