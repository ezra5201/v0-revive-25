-- Replace all outreach locations with comprehensive master list
-- Based on 2025 Outreach Contact Log - PN - Run Tracker data

-- First, clear existing location data
TRUNCATE TABLE outreach_locations RESTART IDENTITY CASCADE;

-- Insert comprehensive master list of all locations from outreach data
INSERT INTO outreach_locations (name, intersection, address, notes, safety_concerns, latitude, longitude, visit_count, last_visited, is_active) VALUES

-- Primary High-Activity Locations
('Hubbard & Desplaines', 'Hubbard St & Desplaines St', NULL, 'Large encampment area - most frequently visited location. Major supply distribution site.', 'Low lighting at night, tensions between different populations, increased verbal aggression noted. Only visit when fully staffed.', 41.8897, -87.6442, 45, '2025-07-24', true),

('Chicago & Albany', 'Chicago Ave & Albany Ave', NULL, 'Regular outreach location with consistent client base. Good for case management follow-ups.', 'Drug dealers have set up drive-through style tent operation on north side. Be vigilant of surroundings.', 41.8958, -87.7058, 35, '2025-07-01', true),

('13th & Ruble', '13th St & Ruble St', NULL, 'Underpass encampment with growing population. Needs frequent tent supplies.', 'Must stand in road on expressway on-ramp to engage. Cars travel very fast. Fire safety concerns - immediate attention needed.', 41.8653, -87.6581, 28, '2025-07-23', true),

-- Secondary Regular Locations  
('Carroll & Hoyne', 'Carroll Ave & Hoyne Ave', NULL, 'Small encampment with regular clients including Foster Oats (wheelchair user).', 'Generally safe location. Site needs regular cleaning.', 41.8897, -87.6775, 22, '2025-07-17', true),

('Ohio & Halsted', 'Ohio St & Halsted St', NULL, 'Individual contacts and small groups. Good for medical follow-ups.', 'Individual with severe frostbite runs when help offered - needs medical attention.', 41.8922, -87.6467, 18, '2025-06-30', true),

('Kinzie & Green', 'Kinzie St & Green St', NULL, 'West side location with married couples and families. Housing waitlist requests common.', 'Site needs cleaning. Good location for family services.', 41.8886, -87.6492, 15, '2025-07-01', true),

-- South Side Locations
('52nd & Lake Park', '52nd St & Lake Park Ave', NULL, 'South side location - regular visits by Redrick & Rolando team.', 'Generally safe area. Housing requests common.', 41.8014, -87.5914, 12, '2025-10-27', true),

('51st & Wentworth', '51st St & Wentworth Ave', NULL, 'South side location near 52nd & Lake Park.', 'Housing needs identified.', 41.8025, -87.6308, 8, '2025-10-27', true),

('30th & Halsted', '30th St & Halsted St', NULL, 'South side location with housing needs.', 'Multiple clients in need of housing and State ID.', 41.8386, -87.6467, 6, '2025-10-27', true),

-- Downtown/Loop Locations
('Michigan & Erie', 'Michigan Ave & Erie St', NULL, 'Downtown area - individual contacts and medical needs.', 'Good for ID, housing, and medical engagement services.', 41.8939, -87.6242, 10, '2025-11-05', true),

('State & Randolph', 'State St & Randolph St', NULL, 'Loop area - emergency housing and CES assessments.', 'High foot traffic area. Good for coordinated entry services.', 41.8847, -87.6278, 8, '2025-06-06', true),

('Michigan & Randolph', 'Michigan Ave & Randolph St', NULL, 'Downtown location near Apple Store.', 'Housing and identification services needed.', 41.8847, -87.6242, 5, '2025-10-08', true),

('Wabash & Randolph', 'Wabash Ave & Randolph St', NULL, 'Loop location near Popeyes.', 'Housing, ID, SSN card, birth certificate needs. Family with newborn.', 41.8847, -87.6264, 4, '2025-10-15', true),

-- Bridge/Underpass Locations
('Lower Wacker Drive', 'Lower Wacker Dr', NULL, 'Bridge underpass location with safety concerns.', 'Isolated location - team felt unsafe due to following car. Use caution.', 41.8869, -87.6364, 12, '2025-07-01', true),

('18th & Canalport', '18th St & Canalport Ave', NULL, 'Canal area location.', 'Regular supply distribution location.', 41.8578, -87.6403, 8, '2025-03-25', true),

('19th & Canalport', '19th St & Canalport Ave', NULL, 'Canal area near 18th Street location.', 'Approximately 9 children living at encampment - authorities notified.', 41.8567, -87.6403, 6, '2025-06-14', true),

-- North Side Locations
('Wilson & Marine Drive', 'Wilson Ave & Marine Dr', NULL, 'North side lakefront location.', 'Extreme cold precautions needed in winter.', 41.9653, -87.6439, 5, '2025-04-30', true),

('Foster & Lake Shore Drive', 'Foster Ave & Lake Shore Dr', NULL, 'North lakefront location.', 'Ms. Rita, 65-year-old needs tent. Extreme cold concerns.', 41.9747, -87.6439, 3, '2025-01-18', true),

-- West Side Locations  
('Humboldt Park', 'Humboldt Park Area', NULL, 'Park area with encampments.', 'Team warned about drinking and dangerous dogs. Cold weather clothes needed.', 41.9078, -87.7014, 8, '2025-11-25', true),

('Division & Homan', 'Division St & Homan Ave', NULL, 'West side location.', 'Regular outreach area.', 41.9031, -87.7097, 2, '2025-03-06', true),

('Augusta & Kedzie', 'Augusta Blvd & Kedzie Ave', NULL, 'West side intersection.', 'Regular canvas area.', 41.8997, -87.7058, 3, '2025-03-07', true),

-- Transportation Hubs
('Union Station', 'Union Station Transit Terminal', '225 S Canal St, Chicago, IL 60606', 'Major transportation hub with transient population.', 'Inside and transit terminal areas checked.', 41.8789, -87.6397, 4, '2025-03-01', true),

('Greyhound Station', 'Greyhound Station on Halsted', '630 W Harrison St, Chicago, IL 60607', 'Bus terminal area.', 'Transportation hub with transient clients.', 41.8742, -87.6467, 3, '2025-06-10', true),

-- Medical/Service Locations
('Northwestern Medicine', 'Michigan Ave & State St Canvas', 'Michigan Ave from Erie to Randolph', 'Medical outreach canvas area.', 'Coordinated with Northwestern Street Medicine.', 41.8939, -87.6242, 6, '2025-05-13', true),

('Revive Center', 'Revive Center', '1668 W Ogden Ave, Chicago, IL 60612', 'ReVive service center - home base.', 'Primary service location and meeting point.', 41.8653, -87.6681, 50, '2025-07-24', true),

-- Specialized Service Areas
('SCLT', 'SCLT Service Location', NULL, 'Specialized service location for housing and legal aid.', 'Housing, documentation, legal representation, and immigration services.', 41.8500, -87.6500, 15, '2025-04-06', true),

-- Police Station Outreach
('Pilsen Police Station', '1412 S Blue Island Ave', '1412 S Blue Island Ave, Chicago, IL 60608', '12th District Police Station area.', 'Unhoused made to leave around 6-7am, return around 9pm.', 41.8578, -87.6597, 4, '2025-03-12', true),

-- Library Locations
('Harold Washington Library', 'Harold Washington Library Center', '400 S State St, Chicago, IL 60605', 'Main library downtown.', 'Good location for services and resources.', 41.8756, -87.6281, 2, '2025-06-30', true),

('Manning Library', 'Manning Library', NULL, 'Library location for case management.', 'Housing and employment services provided.', 41.8500, -87.6400, 3, '2025-01-22', true),

('Madison Street Library', 'Chicago Library at Madison and Seely', 'Madison St & Seely Ave', 'West side library location.', 'Document verification services.', 41.8819, -87.6736, 2, '2025-11-06', true),

-- Healthcare Locations
('Access Health Humboldt Park', 'Access Health (Humboldt Park)', NULL, 'Healthcare facility outreach.', 'Medical services coordination.', 41.9078, -87.7014, 1, '2025-03-10', true),

('Advocate Trinity Hospital', 'Advocate Trinity Hospital', NULL, 'Hospital outreach location.', 'Medical follow-up services.', 41.7200, -87.5500, 1, '2025-03-13', true),

-- Additional Canvas Areas
('Logan Square Canvas', 'Logan Square Area Canvas', NULL, 'Neighborhood canvas area including 606 trail.', 'Tent noticed at Milwaukee and Leavitt.', 41.9297, -87.7058, 5, '2025-05-28', true),

('Central Business District', 'CBD Canvas Area', 'Michigan Ave to Cultural Center to State Loop', 'Downtown business district canvas.', 'High visibility area for outreach.', 41.8819, -87.6278, 8, '2025-04-03', true),

-- Seasonal/Weather Locations
('Engagement Center', 'Engagement Center', NULL, 'Indoor engagement and warming center.', 'Bus cards and gift card distribution point.', 41.8653, -87.6681, 10, '2025-06-14', true);

-- Update visit counts and last visited dates based on CSV frequency analysis
UPDATE outreach_locations SET 
    visit_count = (
        CASE name
            WHEN 'Hubbard & Desplaines' THEN 45
            WHEN 'Chicago & Albany' THEN 35  
            WHEN '13th & Ruble' THEN 28
            WHEN 'Carroll & Hoyne' THEN 22
            WHEN 'Ohio & Halsted' THEN 18
            WHEN 'Kinzie & Green' THEN 15
            WHEN '52nd & Lake Park' THEN 12
            WHEN 'Lower Wacker Drive' THEN 12
            WHEN 'Michigan & Erie' THEN 10
            WHEN 'State & Randolph' THEN 8
            ELSE visit_count
        END
    ),
    last_visited = (
        CASE name
            WHEN 'Hubbard & Desplaines' THEN '2025-07-24'
            WHEN 'Chicago & Albany' THEN '2025-07-01'
            WHEN '13th & Ruble' THEN '2025-07-23'
            WHEN 'Carroll & Hoyne' THEN '2025-07-17'
            WHEN 'Ohio & Halsted' THEN '2025-06-30'
            WHEN 'Kinzie & Green' THEN '2025-07-01'
            WHEN '52nd & Lake Park' THEN '2025-10-27'
            WHEN 'Lower Wacker Drive' THEN '2025-07-01'
            WHEN 'Michigan & Erie' THEN '2025-11-05'
            WHEN 'State & Randolph' THEN '2025-06-06'
            ELSE last_visited
        END
    );

-- Create activity level classification for map visualization
ALTER TABLE outreach_locations ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20);

UPDATE outreach_locations SET activity_level = 
    CASE 
        WHEN visit_count >= 30 THEN 'very_high'
        WHEN visit_count >= 20 THEN 'high'
        WHEN visit_count >= 10 THEN 'medium'
        WHEN visit_count >= 5 THEN 'low'
        ELSE 'very_low'
    END;

-- Add location type classification
ALTER TABLE outreach_locations ADD COLUMN IF NOT EXISTS location_type VARCHAR(50);

UPDATE outreach_locations SET location_type = 
    CASE 
        WHEN name LIKE '%Encampment%' OR notes LIKE '%encampment%' THEN 'encampment'
        WHEN name LIKE '%Library%' OR notes LIKE '%library%' THEN 'library'
        WHEN name LIKE '%Hospital%' OR notes LIKE '%medical%' THEN 'medical'
        WHEN name LIKE '%Station%' OR notes LIKE '%transportation%' THEN 'transportation'
        WHEN name LIKE '%Center%' OR name = 'Revive Center' THEN 'service_center'
        WHEN notes LIKE '%bridge%' OR notes LIKE '%underpass%' THEN 'bridge_underpass'
        WHEN notes LIKE '%downtown%' OR notes LIKE '%loop%' THEN 'downtown'
        WHEN notes LIKE '%canvas%' THEN 'canvas_area'
        ELSE 'street_location'
    END;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_outreach_locations_activity ON outreach_locations(activity_level);
CREATE INDEX IF NOT EXISTS idx_outreach_locations_type ON outreach_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_outreach_locations_coordinates ON outreach_locations(latitude, longitude);

-- Verify the data
SELECT 
    COUNT(*) as total_locations,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as locations_with_coordinates,
    COUNT(CASE WHEN activity_level = 'very_high' THEN 1 END) as very_high_activity,
    COUNT(CASE WHEN activity_level = 'high' THEN 1 END) as high_activity,
    COUNT(CASE WHEN activity_level = 'medium' THEN 1 END) as medium_activity
FROM outreach_locations;
