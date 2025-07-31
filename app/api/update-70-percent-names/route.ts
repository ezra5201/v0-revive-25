import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sqlClient = neon(process.env.DATABASE_URL!)

// Name pools for generating realistic names
const maleFirstNames = [
  "James",
  "Robert",
  "John",
  "Michael",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Christopher",
  "Charles",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Donald",
  "Steven",
  "Paul",
  "Andrew",
  "Joshua",
  "Kenneth",
  "Kevin",
  "Brian",
  "George",
  "Timothy",
  "Ronald",
  "Jason",
  "Edward",
  "Jeffrey",
  "Ryan",
  "Jacob",
  "Gary",
  "Nicholas",
  "Eric",
  "Jonathan",
  "Stephen",
  "Larry",
  "Justin",
  "Scott",
  "Brandon",
]

const femaleFirstNames = [
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Lisa",
  "Nancy",
  "Betty",
  "Helen",
  "Sandra",
  "Donna",
  "Carol",
  "Ruth",
  "Sharon",
  "Michelle",
  "Laura",
  "Amy",
  "Kathleen",
  "Angela",
  "Shirley",
  "Emma",
  "Brenda",
  "Olivia",
  "Cynthia",
  "Marie",
  "Janet",
  "Catherine",
  "Frances",
  "Christine",
  "Samantha",
  "Deborah",
  "Rachel",
  "Carolyn",
  "Janet",
  "Virginia",
]

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
]

function generateUniqueName(existingNames: Set<string>, isMale: boolean): string {
  const firstNames = isMale ? maleFirstNames : femaleFirstNames
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName}`

    if (!existingNames.has(fullName)) {
      existingNames.add(fullName)
      return fullName
    }
    attempts++
  }

  // Fallback: add a number to ensure uniqueness
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  let counter = 1
  let fullName = `${firstName} ${lastName}`

  while (existingNames.has(fullName)) {
    fullName = `${firstName} ${lastName} ${counter}`
    counter++
  }

  existingNames.add(fullName)
  return fullName
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function POST() {
  if (!sqlClient) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
  }

  try {
    // Start transaction
    await sqlClient`BEGIN`

    // Update client names that contain "70%" to remove it
    await sqlClient`
      UPDATE contacts 
      SET client_name = REPLACE(client_name, '70%', '')
      WHERE client_name LIKE '%70%%'
    `

    // Create app_settings table if it doesn't exist
    await sqlClient`
      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Check if 70% update was already completed
    const existingFlag = await sqlClient`
      SELECT value FROM app_settings WHERE key = 'seventy_percent_update_completed'
    `

    if (existingFlag.length > 0 && existingFlag[0].value === "true") {
      await sqlClient`ROLLBACK`
      return NextResponse.json(
        {
          error: "70% name update has already been completed",
        },
        { status: 400 },
      )
    }

    // Get all unique client names from contacts
    const allContacts = await sqlClient`
      SELECT DISTINCT client_name 
      FROM contacts 
      ORDER BY client_name
    `

    if (allContacts.length === 0) {
      await sqlClient`ROLLBACK`
      return NextResponse.json({ error: "No contacts found" }, { status: 400 })
    }

    const allClientNames = allContacts.map((c) => c.client_name)
    const totalClients = allClientNames.length

    // Calculate 70% (rounded)
    const clientsToUpdate = Math.round(totalClients * 0.7)
    const clientsToKeep = totalClients - clientsToUpdate

    // Randomly select 70% of clients to update
    const shuffledClients = shuffleArray(allClientNames)
    const clientsToUpdateList = shuffledClients.slice(0, clientsToUpdate)
    const clientsToKeepList = shuffledClients.slice(clientsToUpdate)

    // Get existing names to avoid duplicates
    const existingNames = new Set(allClientNames)

    // Generate new names maintaining 60% male / 40% female ratio
    const maleNamesToGenerate = Math.round(clientsToUpdate * 0.6)
    const femaleNamesToGenerate = clientsToUpdate - maleNamesToGenerate

    const newNames: string[] = []

    // Generate male names
    for (let i = 0; i < maleNamesToGenerate; i++) {
      const newName = generateUniqueName(existingNames, true)
      newNames.push(newName)
    }

    // Generate female names
    for (let i = 0; i < femaleNamesToGenerate; i++) {
      const newName = generateUniqueName(existingNames, false)
      newNames.push(newName)
    }

    // Shuffle new names to randomize assignment
    const shuffledNewNames = shuffleArray(newNames)

    // Create mapping of old names to new names
    const nameMapping: { [oldName: string]: string } = {}
    clientsToUpdateList.forEach((oldName, index) => {
      nameMapping[oldName] = shuffledNewNames[index]
    })

    // Update contacts table in bulk
    const oldNames = Object.keys(nameMapping)
    const newNamesArray = Object.values(nameMapping)

    await sqlClient`
      UPDATE contacts 
      SET client_name = new_names.new_name
      FROM (
        SELECT UNNEST(${oldNames}::text[]) as old_name,
               UNNEST(${newNamesArray}::text[]) as new_name
      ) as new_names
      WHERE contacts.client_name = new_names.old_name
    `

    // Update clients table - delete old entries and insert new ones
    await sqlClient`DELETE FROM clients WHERE name = ANY(${oldNames})`

    // Insert new client entries
    for (const newName of newNamesArray) {
      await sqlClient`
        INSERT INTO clients (name, category, active) 
        VALUES (${newName}, 'Client', true)
        ON CONFLICT (name) DO NOTHING
      `
    }

    // Set completion flag
    await sqlClient`
      INSERT INTO app_settings (key, value) 
      VALUES ('seventy_percent_update_completed', 'true')
      ON CONFLICT (key) DO UPDATE SET 
        value = 'true',
        updated_at = CURRENT_TIMESTAMP
    `

    // Commit transaction
    await sqlClient`COMMIT`

    const statistics = {
      totalContacts: totalClients,
      contactsUpdated: clientsToUpdate,
      contactsUnchanged: clientsToKeep,
      percentageUpdated: Math.round((clientsToUpdate / totalClients) * 100),
      maleNamesGenerated: maleNamesToGenerate,
      femaleNamesGenerated: femaleNamesToGenerate,
    }

    return NextResponse.json({
      message: "Successfully updated 70% of client names",
      statistics,
    })
  } catch (error) {
    await sqlClient`ROLLBACK`
    console.error("Error updating 70% of client names:", error)
    return NextResponse.json(
      {
        error: "Failed to update client names",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
