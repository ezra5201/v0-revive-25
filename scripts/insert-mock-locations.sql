-- Insert generated mock locations into the database
-- Run this after generating the JSON file with the Python script

-- Note: This script assumes you have the mock_outreach_locations.json file
-- You'll need to manually copy the INSERT statements from the generated JSON

-- Example of how the data will be inserted:
-- INSERT INTO outreach_locations (
--   id, name, address, intersection, latitude, longitude, 
--   notes, safety_concerns, last_visited, visit_count, 
--   is_active, created_at, updated_at
-- ) VALUES 
-- (100, 'Ashland & Division', '1234 N Ashland Ave, Chicago, IL 60622', 'Ashland Ave & Division St', 41.87234567, -87.66789012, 'Regular encampment with 3-5 individuals', NULL, '2024-12-15', 15, true, '2024-01-15 10:30:00.123456', '2024-12-20 14:45:00.789012'),
-- ... (additional records)

-- After running the Python script, you can convert the JSON to SQL INSERT statements
-- or load the data programmatically through the API

SELECT 'Mock location generation script ready - run the Python script first' as status;
