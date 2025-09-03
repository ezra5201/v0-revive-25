-- Populate coordinates for known Chicago outreach locations
-- This will dramatically improve map loading performance

UPDATE outreach_locations SET 
  latitude = 41.8902, longitude = -87.6431, 
  address = '600 W Hubbard St, Chicago, IL 60654'
WHERE name = 'Hubbard & Desplaines' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8950, longitude = -87.7070,
  address = '2800 W Chicago Ave, Chicago, IL 60622'  
WHERE name = 'Chicago & Albany' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8650, longitude = -87.6700,
  address = '1300 S Ruble St, Chicago, IL 60608'
WHERE name = '13th & Ruble' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8920, longitude = -87.6770,
  address = '1900 W Carroll Ave, Chicago, IL 60612'
WHERE name = 'Carroll & Hoyne' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8930, longitude = -87.6470,
  address = '500 N Halsted St, Chicago, IL 60642'
WHERE name = 'Ohio & Halsted' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8020, longitude = -87.5890,
  address = '5200 S Lake Park Ave, Chicago, IL 60615'
WHERE name = '52nd & Lake Park' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8940, longitude = -87.6240,
  address = '600 N Michigan Ave, Chicago, IL 60611'
WHERE name = 'Michigan & Erie' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8850, longitude = -87.6280,
  address = '1 N State St, Chicago, IL 60602'
WHERE name = 'State & Randolph' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8870, longitude = -87.6360,
  address = '300 E Lower Wacker Dr, Chicago, IL 60601'
WHERE name = 'Lower Wacker Drive' AND latitude IS NULL;

UPDATE outreach_locations SET 
  latitude = 41.8890, longitude = -87.6480,
  address = '500 W Kinzie St, Chicago, IL 60654'
WHERE name = 'Kinzie & Green' AND latitude IS NULL;

-- Add the Revive Center location if it doesn't exist
INSERT INTO outreach_locations (name, address, intersection, latitude, longitude, notes, is_active)
VALUES (
  'Revive Center', 
  '1668 W Ogden Ave, Chicago, IL 60612',
  'Ogden Ave & Ashland Ave',
  41.8570, 
  -87.6660,
  'Main Revive Center location - headquarters',
  true
)
ON CONFLICT (name) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  address = EXCLUDED.address,
  intersection = EXCLUDED.intersection;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_outreach_locations_coordinates 
ON outreach_locations(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_locations_active 
ON outreach_locations(is_active, visit_count DESC);
