-- Replace placeholder with complete SQL INSERT statements for mock Chicago locations
-- Insert mock outreach locations within 5-mile radius of ReVive Center (41.8653, -87.6681)
-- Distributed to south, west, and east for better map demonstration

INSERT INTO outreach_locations (
  id, name, address, intersection, latitude, longitude, 
  notes, safety_concerns, last_visited, visit_count, 
  is_active, created_at, updated_at
) VALUES 
-- South Side Locations
(101, 'Halsted & Roosevelt', '1200 S Halsted St, Chicago, IL 60607', 'Halsted St & Roosevelt Rd', 41.8677, -87.6467, 'Small encampment under bridge, 2-3 individuals. Good rapport established.', 'Heavy traffic area, use caution crossing', '2024-12-18', 8, true, '2024-01-15 10:30:00', '2024-12-18 14:45:00'),

(102, 'Ashland & Cermak', '2200 S Ashland Ave, Chicago, IL 60608', 'Ashland Ave & Cermak Rd', 41.8532, -87.6664, 'Regular group of 4-5 people. Very receptive to services.', NULL, '2024-12-20', 12, true, '2024-02-01 09:15:00', '2024-12-20 16:20:00'),

(103, 'State & 18th', '1800 S State St, Chicago, IL 60616', 'State St & 18th St', 41.8578, -87.6267, 'Individual with mental health needs. Connects well with our team.', 'Area can be isolated at night', '2024-12-19', 6, true, '2024-03-10 11:45:00', '2024-12-19 13:30:00'),

(104, 'Western & 26th', '2600 S Western Ave, Chicago, IL 60608', 'Western Ave & 26th St', 41.8456, -87.6853, 'Family with children. Referred to housing services.', NULL, '2024-12-17', 4, true, '2024-04-05 14:20:00', '2024-12-17 10:15:00'),

(105, 'Blue Island & 18th', '1800 S Blue Island Ave, Chicago, IL 60608', 'Blue Island Ave & 18th St', 41.8578, -87.6598, 'Veteran experiencing homelessness. Connected to VA services.', NULL, '2024-12-21', 9, true, '2024-01-20 08:30:00', '2024-12-21 15:45:00'),

-- West Side Locations
(106, 'Pulaski & North Ave', '1600 N Pulaski Rd, Chicago, IL 60639', 'Pulaski Rd & North Ave', 41.9097, -87.7242, 'Active encampment with 6-8 individuals. Weekly visits established.', 'High crime area, visit in pairs', '2024-12-20', 15, true, '2024-01-08 12:00:00', '2024-12-20 11:30:00'),

(107, 'Kedzie & Division', '1200 N Kedzie Ave, Chicago, IL 60651', 'Kedzie Ave & Division St', 41.9031, -87.7058, 'Elderly individual with health issues. Medical referrals made.', NULL, '2024-12-19', 7, true, '2024-02-15 13:45:00', '2024-12-19 09:20:00'),

(108, 'California & Augusta', '1000 N California Ave, Chicago, IL 60622', 'California Ave & Augusta Blvd', 41.8997, -87.6975, 'Young adult, recently homeless. Job placement assistance provided.', NULL, '2024-12-18', 5, true, '2024-03-22 16:10:00', '2024-12-18 14:55:00'),

(109, 'Cicero & Lake', '200 N Cicero Ave, Chicago, IL 60644', 'Cicero Ave & Lake St', 41.8853, -87.7453, 'Couple with pets. Pet-friendly shelter referrals made.', 'Busy intersection, high traffic', '2024-12-21', 11, true, '2024-01-30 10:45:00', '2024-12-21 12:15:00'),

(110, 'Grand & Kostner', '4400 W Grand Ave, Chicago, IL 60651', 'Grand Ave & Kostner Ave', 41.8917, -87.7339, 'Individual with substance use issues. Treatment referrals provided.', NULL, '2024-12-17', 8, true, '2024-02-28 15:30:00', '2024-12-17 11:40:00'),

-- East Side Locations  
(111, 'Michigan & Randolph', '151 N Michigan Ave, Chicago, IL 60601', 'Michigan Ave & Randolph St', 41.8847, -87.6244, 'Downtown location, individual moves frequently. Difficult to maintain contact.', 'Heavy pedestrian traffic', '2024-12-16', 3, true, '2024-04-12 09:00:00', '2024-12-16 17:25:00'),

(112, 'Columbus & Lower Wacker', '400 E Lower Wacker Dr, Chicago, IL 60601', 'Columbus Dr & Lower Wacker Dr', 41.8869, -87.6189, 'Sheltered area under bridge. Group of 3-4 individuals.', 'Limited visibility, use flashlights', '2024-12-20', 10, true, '2024-01-25 14:15:00', '2024-12-20 08:45:00'),

(113, 'Lake Shore & Oak', '1000 N Lake Shore Dr, Chicago, IL 60611', 'Lake Shore Dr & Oak St', 41.9008, -87.6267, 'Beachfront area, seasonal population. Summer outreach focus.', 'Weather dependent access', '2024-12-15', 6, false, '2024-05-18 11:20:00', '2024-12-15 16:50:00'),

(114, 'Wabash & Harrison', '600 S Wabash Ave, Chicago, IL 60605', 'Wabash Ave & Harrison St', 41.8742, -87.6258, 'Near transit hub. High turnover population.', NULL, '2024-12-19', 14, true, '2024-02-08 13:25:00', '2024-12-19 10:35:00'),

(115, 'State & Van Buren', '400 S State St, Chicago, IL 60605', 'State St & Van Buren St', 41.8769, -87.6278, 'Loop area, business district. Daytime visits most effective.', 'Security presence, coordinate visits', '2024-12-18', 5, true, '2024-03-15 12:40:00', '2024-12-18 15:10:00'),

-- Additional Strategic Locations
(116, 'Damen & North', '1600 N Damen Ave, Chicago, IL 60647', 'Damen Ave & North Ave', 41.9097, -87.6775, 'Bucktown area. Individual with artistic background, very engaging.', NULL, '2024-12-21', 7, true, '2024-04-01 10:25:00', '2024-12-21 13:55:00'),

(117, 'Ashland & Lake', '100 N Ashland Ave, Chicago, IL 60607', 'Ashland Ave & Lake St', 41.8853, -87.6664, 'Near medical district. Good for health service referrals.', NULL, '2024-12-17', 9, true, '2024-01-12 15:50:00', '2024-12-17 09:30:00'),

(118, 'Halsted & North', '1600 N Halsted St, Chicago, IL 60614', 'Halsted St & North Ave', 41.9097, -87.6467, 'Lincoln Park area. Elderly woman, very kind. Regular check-ins.', NULL, '2024-12-20', 13, true, '2024-02-20 11:15:00', '2024-12-20 14:20:00'),

(119, 'Western & Division', '1200 N Western Ave, Chicago, IL 60622', 'Western Ave & Division St', 41.9031, -87.6853, 'Wicker Park vicinity. Young person, recently aged out of foster care.', NULL, '2024-12-19', 4, true, '2024-03-28 16:45:00', '2024-12-19 12:05:00'),

(120, 'Clark & North', '1600 N Clark St, Chicago, IL 60614', 'Clark St & North Ave', 41.9097, -87.6364, 'Old Town area. Veteran with PTSD, building trust slowly.', 'Crowded tourist area on weekends', '2024-12-18', 6, true, '2024-04-08 08:20:00', '2024-12-18 11:25:00');
</sql>
