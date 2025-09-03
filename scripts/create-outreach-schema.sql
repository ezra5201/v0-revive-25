-- Create Outreach Database Schema
-- This script sets up the database structure for the outreach management system

-- Outreach Locations Master List
CREATE TABLE IF NOT EXISTS outreach_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    intersection VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    safety_concerns TEXT,
    last_visited DATE,
    visit_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outreach Runs Scheduler
CREATE TABLE IF NOT EXISTS outreach_runs (
    id SERIAL PRIMARY KEY,
    run_date DATE NOT NULL,
    run_time TIME,
    lead_staff VARCHAR(255) NOT NULL,
    team_members TEXT[], -- Array of team member names
    planned_locations INTEGER[], -- Array of location IDs
    actual_locations INTEGER[], -- Array of location IDs actually visited
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    safety_notes TEXT,
    follow_up_notes TEXT,
    total_contacts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Management
CREATE TABLE IF NOT EXISTS outreach_inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- supplies, medical, clothing, food, etc.
    current_stock INTEGER DEFAULT 0,
    minimum_threshold INTEGER DEFAULT 10,
    unit_type VARCHAR(50), -- pieces, boxes, bags, etc.
    cost_per_unit DECIMAL(10, 2),
    supplier VARCHAR(255),
    last_restocked DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outreach Clients (Enhanced from existing contact system)
CREATE TABLE IF NOT EXISTS outreach_clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    pronouns VARCHAR(50),
    date_of_birth DATE,
    phone VARCHAR(20),
    email VARCHAR(255),
    ces_number VARCHAR(50),
    ces_date_updated DATE,
    primary_case_manager VARCHAR(255),
    initial_location_id INTEGER REFERENCES outreach_locations(id),
    safety_concerns TEXT,
    roi_consent_given BOOLEAN DEFAULT false,
    medical_insurance VARCHAR(255),
    has_state_id BOOLEAN DEFAULT false,
    has_birth_certificate BOOLEAN DEFAULT false,
    has_homeless_letter BOOLEAN DEFAULT false,
    other_agency VARCHAR(255),
    other_agency_case_manager VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Street Contact Capture
CREATE TABLE IF NOT EXISTS outreach_contacts (
    id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES outreach_runs(id),
    client_id INTEGER REFERENCES outreach_clients(id),
    location_id INTEGER REFERENCES outreach_locations(id),
    contact_date DATE NOT NULL,
    contact_time TIME,
    staff_member VARCHAR(255),
    services_provided TEXT[],
    supplies_given JSONB, -- {"narcan": 2, "food_bags": 1, "hygiene_kits": 1}
    narcan_administered BOOLEAN DEFAULT false,
    medical_concerns TEXT,
    housing_status VARCHAR(100),
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Run Supplies Tracking
CREATE TABLE IF NOT EXISTS outreach_run_supplies (
    id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES outreach_runs(id),
    inventory_item_id INTEGER REFERENCES outreach_inventory(id),
    quantity_taken INTEGER NOT NULL,
    quantity_distributed INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Alerts
CREATE TABLE IF NOT EXISTS outreach_inventory_alerts (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER REFERENCES outreach_inventory(id),
    alert_type VARCHAR(50), -- low_stock, out_of_stock, reorder_needed
    alert_message TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_outreach_runs_date ON outreach_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_date ON outreach_contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_client ON outreach_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_run ON outreach_contacts(run_id);
CREATE INDEX IF NOT EXISTS idx_outreach_inventory_stock ON outreach_inventory(current_stock, minimum_threshold);
CREATE INDEX IF NOT EXISTS idx_outreach_clients_ces ON outreach_clients(ces_number);

-- Insert some initial inventory items based on the CSV data
INSERT INTO outreach_inventory (item_name, category, current_stock, minimum_threshold, unit_type) VALUES
('Narcan', 'medical', 50, 10, 'doses'),
('Harm Reduction Kits', 'medical', 30, 5, 'kits'),
('Food Bags', 'food', 100, 20, 'bags'),
('Bus Cards', 'transportation', 25, 5, 'cards'),
('Clothing Items', 'clothing', 50, 10, 'pieces'),
('Hygiene Kits', 'hygiene', 40, 8, 'kits'),
('Gift Cards', 'assistance', 20, 5, 'cards'),
('Water Bottles', 'food', 200, 50, 'bottles'),
('Blankets', 'clothing', 30, 10, 'pieces'),
('Tents', 'shelter', 15, 3, 'pieces'),
('Hand Warmers', 'supplies', 100, 20, 'pieces'),
('Masks', 'medical', 200, 50, 'pieces'),
('Hand Sanitizer', 'hygiene', 50, 10, 'bottles')
ON CONFLICT DO NOTHING;

-- Insert some common outreach locations based on the CSV data
INSERT INTO outreach_locations (name, intersection, notes) VALUES
('Hubbard & Desplaines', 'Hubbard St & Desplaines St', 'Large encampment area'),
('Chicago & Albany', 'Chicago Ave & Albany Ave', 'Regular outreach location'),
('13th & Ruble', '13th St & Ruble St', 'Underpass encampment'),
('Carroll & Hoyne', 'Carroll Ave & Hoyne Ave', 'Small encampment'),
('Ohio & Halsted', 'Ohio St & Halsted St', 'Individual contacts'),
('52nd & Lake Park', '52nd St & Lake Park Ave', 'South side location'),
('Michigan & Erie', 'Michigan Ave & Erie St', 'Downtown area'),
('State & Randolph', 'State St & Randolph St', 'Loop area'),
('Lower Wacker Drive', 'Lower Wacker Dr', 'Bridge underpass'),
('Kinzie & Green', 'Kinzie St & Green St', 'West side location')
ON CONFLICT DO NOTHING;
