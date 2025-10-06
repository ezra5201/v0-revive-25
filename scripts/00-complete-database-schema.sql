-- Complete Database Schema for ReVive IMPACT
-- This script creates all necessary tables for the application
-- Run this script first on a new HIPAA-compliant Neon database

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Clients table (master list of all clients and prospects)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) DEFAULT 'Prospect',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category);

-- Contacts table (daily check-ins and service tracking)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  contact_date DATE NOT NULL,
  days_ago INTEGER DEFAULT 0,
  provider_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'Prospect',
  food_accessed BOOLEAN DEFAULT false,
  services_requested JSONB DEFAULT '[]'::jsonb,
  services_provided JSONB DEFAULT '[]'::jsonb,
  comments TEXT DEFAULT '',
  alert_id INTEGER,
  
  -- Integer columns for fast service filtering
  case_management_requested INTEGER DEFAULT 0,
  case_management_provided INTEGER DEFAULT 0,
  occupational_therapy_requested INTEGER DEFAULT 0,
  occupational_therapy_provided INTEGER DEFAULT 0,
  food_requested INTEGER DEFAULT 0,
  food_provided INTEGER DEFAULT 0,
  healthcare_requested INTEGER DEFAULT 0,
  healthcare_provided INTEGER DEFAULT 0,
  housing_requested INTEGER DEFAULT 0,
  housing_provided INTEGER DEFAULT 0,
  employment_requested INTEGER DEFAULT 0,
  employment_provided INTEGER DEFAULT 0,
  benefits_requested INTEGER DEFAULT 0,
  benefits_provided INTEGER DEFAULT 0,
  legal_requested INTEGER DEFAULT 0,
  legal_provided INTEGER DEFAULT 0,
  transportation_requested INTEGER DEFAULT 0,
  transportation_provided INTEGER DEFAULT 0,
  childcare_requested INTEGER DEFAULT 0,
  childcare_provided INTEGER DEFAULT 0,
  mental_health_requested INTEGER DEFAULT 0,
  mental_health_provided INTEGER DEFAULT 0,
  substance_abuse_requested INTEGER DEFAULT 0,
  substance_abuse_provided INTEGER DEFAULT 0,
  education_requested INTEGER DEFAULT 0,
  education_provided INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_date ON contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_name);
CREATE INDEX IF NOT EXISTS idx_contacts_provider ON contacts(provider_name);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_cm_requested ON contacts(case_management_requested);
CREATE INDEX IF NOT EXISTS idx_contacts_ot_requested ON contacts(occupational_therapy_requested);

-- Alerts table (behavioral alerts and safety concerns)
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  alert_type VARCHAR(50) DEFAULT 'behavioral',
  alert_details TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'active',
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  expires_at DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_client ON alerts(client_name);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_contact_id ON alerts(contact_id);
CREATE INDEX IF NOT EXISTS idx_alerts_expires_at ON alerts(expires_at);

-- Add alert_id foreign key to contacts (if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'alert_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN alert_id INTEGER REFERENCES alerts(id);
    CREATE INDEX idx_contacts_alert_id ON contacts(alert_id);
  END IF;
END $$;

-- ============================================================================
-- CASE MANAGEMENT TABLES
-- ============================================================================

-- CM Check-ins table
CREATE TABLE IF NOT EXISTS cm_checkins (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  client_uuid UUID,
  provider_name VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cm_checkins_client ON cm_checkins(client_name);
CREATE INDEX IF NOT EXISTS idx_cm_checkins_uuid ON cm_checkins(client_uuid);
CREATE INDEX IF NOT EXISTS idx_cm_checkins_status ON cm_checkins(status);
CREATE INDEX IF NOT EXISTS idx_cm_checkins_date ON cm_checkins(created_at);

-- CM Goals table
CREATE TABLE IF NOT EXISTS cm_goals (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_uuid UUID,
  goal_text TEXT NOT NULL,
  target_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'active',
  checkin_id INTEGER REFERENCES cm_checkins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cm_goals_client ON cm_goals(client_name);
CREATE INDEX IF NOT EXISTS idx_cm_goals_uuid ON cm_goals(client_uuid);
CREATE INDEX IF NOT EXISTS idx_cm_goals_status ON cm_goals(status);
CREATE INDEX IF NOT EXISTS idx_cm_goals_checkin ON cm_goals(checkin_id);

-- CM Goal Progress table
CREATE TABLE IF NOT EXISTS cm_goal_progress (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER REFERENCES cm_goals(id) ON DELETE CASCADE,
  progress_note TEXT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cm_goal_progress_goal ON cm_goal_progress(goal_id);

-- ============================================================================
-- OCCUPATIONAL THERAPY TABLES
-- ============================================================================

-- OT Check-ins table
CREATE TABLE IF NOT EXISTS ot_checkins (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  client_uuid UUID,
  provider_name VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ot_checkins_client ON ot_checkins(client_name);
CREATE INDEX IF NOT EXISTS idx_ot_checkins_uuid ON ot_checkins(client_uuid);
CREATE INDEX IF NOT EXISTS idx_ot_checkins_status ON ot_checkins(status);
CREATE INDEX IF NOT EXISTS idx_ot_checkins_date ON ot_checkins(created_at);

-- OT Goals table
CREATE TABLE IF NOT EXISTS ot_goals (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_uuid UUID,
  goal_text TEXT NOT NULL,
  target_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'active',
  checkin_id INTEGER REFERENCES ot_checkins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ot_goals_client ON ot_goals(client_name);
CREATE INDEX IF NOT EXISTS idx_ot_goals_uuid ON ot_goals(client_uuid);
CREATE INDEX IF NOT EXISTS idx_ot_goals_status ON ot_goals(status);
CREATE INDEX IF NOT EXISTS idx_ot_goals_checkin ON ot_goals(checkin_id);

-- OT Goal Progress table
CREATE TABLE IF NOT EXISTS ot_goal_progress (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER REFERENCES ot_goals(id) ON DELETE CASCADE,
  progress_note TEXT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ot_goal_progress_goal ON ot_goal_progress(goal_id);

-- ============================================================================
-- INTAKE FORMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS intake_forms (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Basic Information
  name VARCHAR(255),
  pronouns VARCHAR(50),
  date_of_birth DATE,
  birth_year INTEGER,
  program VARCHAR(100),
  how_heard_about_us TEXT,
  
  -- Support Needs (JSON arrays)
  needs JSONB DEFAULT '[]'::jsonb,
  see_staff JSONB DEFAULT '[]'::jsonb,
  other_support TEXT,
  
  -- Language
  languages TEXT[],
  
  -- Housing Status
  current_housing_status JSONB DEFAULT '[]'::jsonb,
  past_housing_status JSONB DEFAULT '[]'::jsonb,
  
  -- Demographics
  race VARCHAR(100),
  ethnicity VARCHAR(50),
  gender VARCHAR(50),
  is_disabled BOOLEAN,
  is_veteran BOOLEAN,
  
  -- Employment and Income
  employment_status VARCHAR(50),
  income_sources JSONB DEFAULT '[]'::jsonb,
  
  -- Goals
  goal_1 TEXT,
  goal_2 TEXT,
  goal_3 TEXT,
  
  -- Contact Information
  phone VARCHAR(20),
  email VARCHAR(255),
  preferred_contact_method VARCHAR(100),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Form Metadata
  completion_percentage INTEGER DEFAULT 0,
  section_completion JSONB DEFAULT '{}'::jsonb,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_intake_forms_client_id ON intake_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_completion ON intake_forms(completion_percentage);

-- ============================================================================
-- APP SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- ============================================================================
-- SERVICES UPDATE LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS services_update_log (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER,
  old_services_requested JSONB,
  new_services_requested JSONB,
  old_services_provided JSONB,
  new_services_provided JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_update_log_contact ON services_update_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_services_update_log_date ON services_update_log(updated_at);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Core database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run 01-outreach-schema.sql to add outreach tables';
  RAISE NOTICE '2. Optionally run data migration scripts to import existing data';
END $$;
