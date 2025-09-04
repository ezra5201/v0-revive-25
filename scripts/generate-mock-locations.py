import json
import math
import random
from datetime import datetime, timedelta

# ReVive Center coordinates
REVIVE_LAT = 41.8653
REVIVE_LON = -87.6681
RADIUS_MILES = 5

# Convert miles to degrees (approximate)
MILES_TO_DEGREES = 1 / 69.0  # 1 degree ≈ 69 miles

def generate_coordinates_in_radius(center_lat, center_lon, radius_miles):
    """Generate random coordinates within radius of center point"""
    # Convert radius to degrees
    radius_deg = radius_miles * MILES_TO_DEGREES
    
    # Generate random angle and distance
    angle = random.uniform(0, 2 * math.pi)
    distance = random.uniform(0.5, radius_deg)  # Start at 0.5 miles minimum
    
    # Calculate new coordinates
    lat = center_lat + (distance * math.cos(angle))
    lon = center_lon + (distance * math.sin(angle))
    
    return round(lat, 8), round(lon, 8)

def get_chicago_street_name():
    """Generate realistic Chicago street names"""
    streets = [
        "Ashland", "Western", "Kedzie", "Pulaski", "Cicero", "Central", "Austin",
        "Harlem", "Oak Park", "Ridgeland", "East End", "Stony Island", "Cottage Grove",
        "King Drive", "State", "Wabash", "Michigan", "Columbus", "Lake Shore",
        "Clark", "LaSalle", "Wells", "Franklin", "Wacker", "Canal", "Clinton",
        "Jefferson", "Des Plaines", "Halsted", "Union", "Racine", "Ashland",
        "Paulina", "Wood", "Wolcott", "Damen", "Hoyne", "Leavitt", "Oakley",
        "California", "Rockwell", "Talman", "Washtenaw", "Fairfield", "Mozart"
    ]
    
    cross_streets = [
        "Division", "North", "Armitage", "Fullerton", "Belmont", "Addison",
        "Irving Park", "Montrose", "Lawrence", "Foster", "Bryn Mawr", "Devon",
        "Roosevelt", "Cermak", "31st", "35th", "39th", "43rd", "47th", "51st",
        "55th", "59th", "63rd", "67th", "71st", "75th", "79th", "83rd", "87th",
        "95th", "103rd", "111th", "119th", "127th", "135th", "Madison", "Washington",
        "Randolph", "Lake", "Kinzie", "Grand", "Ohio", "Ontario", "Erie", "Huron",
        "Superior", "Chicago", "Augusta", "Crystal", "Potomac", "Thomas", "Cortez"
    ]
    
    return random.choice(streets), random.choice(cross_streets)

def generate_realistic_notes():
    """Generate realistic outreach location notes"""
    notes_options = [
        "Regular encampment with 3-5 individuals",
        "Small group, usually 2-3 people",
        "Large encampment area with rotating population",
        "Individual contacts, good for case management",
        "Underpass location, weather protection needed",
        "Bridge area with safety concerns",
        "Park location with seasonal activity",
        "Transportation hub with transient population",
        "Downtown area with high foot traffic",
        "Residential area with established clients",
        "Industrial area with warehouse workers",
        "Medical district outreach location",
        "University area with student volunteers",
        "Shopping district with business partnerships",
        "Lakefront location with seasonal variations",
        "West side community with strong networks",
        "South side location with family services",
        "North side area with mental health focus",
        "Loop location for employment services",
        "Neighborhood canvas area with regular routes"
    ]
    
    return random.choice(notes_options)

def generate_safety_concerns():
    """Generate realistic safety concerns (some locations)"""
    if random.random() > 0.3:  # 30% chance of safety concerns
        return None
    
    concerns = [
        "Low lighting at night, recommend daytime visits only",
        "Heavy traffic area, use caution when parking",
        "Drug activity reported, maintain awareness of surroundings",
        "Aggressive individuals noted, visit with full team only",
        "Unstable structures, avoid during high winds",
        "Flooding concerns during heavy rain",
        "Limited cell service, check in frequently",
        "Police activity in area, coordinate with local authorities",
        "Construction zone, follow posted safety signs",
        "Isolated location, use buddy system"
    ]
    
    return random.choice(concerns)

def generate_mock_locations(count=25):
    """Generate mock outreach locations"""
    locations = []
    
    # Ensure good geographic distribution
    directions = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest']
    
    for i in range(count):
        # Generate coordinates
        lat, lon = generate_coordinates_in_radius(REVIVE_LAT, REVIVE_LON, RADIUS_MILES)
        
        # Generate street names
        street1, street2 = get_chicago_street_name()
        
        # Create location data
        location = {
            "id": 100 + i,  # Start at 100 to avoid conflicts
            "name": f"{street1} & {street2}",
            "address": f"{random.randint(100, 9999)} {random.choice(['N', 'S', 'E', 'W'])} {street1} {random.choice(['St', 'Ave', 'Blvd'])}, Chicago, IL {random.randint(60601, 60699)}",
            "intersection": f"{street1} {random.choice(['St', 'Ave', 'Blvd'])} & {street2} {random.choice(['St', 'Ave', 'Blvd'])}",
            "latitude": f"{lat:.8f}",
            "longitude": f"{lon:.8f}",
            "notes": generate_realistic_notes(),
            "safety_concerns": generate_safety_concerns(),
            "last_visited": None if random.random() > 0.7 else (datetime.now() - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d"),
            "visit_count": random.randint(0, 25),
            "is_active": random.choice([True, True, True, False]),  # 75% active
            "created_at": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d %H:%M:%S.%f"),
            "updated_at": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d %H:%M:%S.%f")
        }
        
        locations.append(location)
    
    return locations

def main():
    print("Generating mock Chicago outreach locations...")
    
    # Generate locations
    mock_locations = generate_mock_locations(25)
    
    # Sort by visit count (descending) for better demo
    mock_locations.sort(key=lambda x: x['visit_count'], reverse=True)
    
    # Save to JSON file
    with open('mock_outreach_locations.json', 'w') as f:
        json.dump(mock_locations, f, indent=2)
    
    print(f"Generated {len(mock_locations)} mock locations")
    print("Saved to: mock_outreach_locations.json")
    
    # Print summary statistics
    active_count = sum(1 for loc in mock_locations if loc['is_active'])
    safety_count = sum(1 for loc in mock_locations if loc['safety_concerns'])
    total_visits = sum(loc['visit_count'] for loc in mock_locations)
    
    print(f"\nSummary:")
    print(f"- Active locations: {active_count}/{len(mock_locations)}")
    print(f"- Locations with safety concerns: {safety_count}")
    print(f"- Total visit count: {total_visits}")
    print(f"- Average visits per location: {total_visits/len(mock_locations):.1f}")
    
    # Show geographic distribution
    north = sum(1 for loc in mock_locations if float(loc['latitude']) > REVIVE_LAT)
    south = sum(1 for loc in mock_locations if float(loc['latitude']) < REVIVE_LAT)
    east = sum(1 for loc in mock_locations if float(loc['longitude']) > REVIVE_LON)
    west = sum(1 for loc in mock_locations if float(loc['longitude']) < REVIVE_LON)
    
    print(f"\nGeographic distribution:")
    print(f"- North of center: {north}")
    print(f"- South of center: {south}")
    print(f"- East of center: {east}")
    print(f"- West of center: {west}")

if __name__ == "__main__":
    main()
