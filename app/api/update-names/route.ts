import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

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
  "Benjamin",
  "Samuel",
  "Gregory",
  "Alexander",
  "Patrick",
  "Frank",
  "Raymond",
  "Jack",
  "Dennis",
  "Jerry",
  "Tyler",
  "Aaron",
  "Jose",
  "Henry",
  "Adam",
  "Douglas",
  "Nathan",
  "Peter",
  "Zachary",
  "Kyle",
  "Noah",
  "Alan",
  "Ethan",
  "Jeremy",
  "Lionel",
  "Angel",
  "Wayne",
  "Carl",
  "Harold",
  "Arthur",
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
  "Debra",
  "Rachel",
  "Carolyn",
  "Virginia",
  "Maria",
  "Heather",
  "Diane",
  "Julie",
  "Joyce",
  "Victoria",
  "Kelly",
  "Christina",
  "Joan",
  "Evelyn",
  "Lauren",
  "Judith",
  "Megan",
  "Andrea",
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
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
  "Long",
  "Ross",
  "Foster",
  "Jimenez",
]

function generateUniqueName(existingNames: Set<string>, isMale: boolean): string {
  const firstNames = isMale ? maleFirstNames : femaleFirstNames
  let attempts = 0
  const maxAttempts = 1000

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

export async function POST(request: Request) {
  try {
    const { oldName, newName } = await request.json()
    const sqlClient = neon(process.env.DATABASE_URL!)

    const result = await sqlClient`
      UPDATE contacts 
      SET client_name = ${newName}
      WHERE client_name = ${oldName}
    `

    return NextResponse.json({
      success: true,
      recordsUpdated: result.length,
    })
  } catch (error) {
    console.error("Update names error:", error)
    return NextResponse.json({ success: false, error: "Failed to update names" }, { status: 500 })
  }

  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    console.log("Generating unique client names...")

    // Get existing contacts
    const existingContacts = await sql.query("SELECT id FROM contacts ORDER BY id")
    const totalContacts = existingContacts.length

    if (totalContacts === 0) {
      return NextResponse.json({ error: "No contacts found in database" }, { status: 400 })
    }

    // Calculate 60% male names
    const maleCount = Math.ceil(totalContacts * 0.6)
    const femaleCount = totalContacts - maleCount

    console.log(`Generating ${maleCount} male names and ${femaleCount} female names`)

    // Generate unique names
    const existingNames = new Set<string>()
    const nameUpdates: { id: number; name: string; isMale: boolean }[] = []

    // Generate male names first
    for (let i = 0; i < maleCount; i++) {
      const contact = existingContacts[i]
      const name = generateUniqueName(existingNames, true)
      nameUpdates.push({ id: contact.id, name, isMale: true })
    }

    // Generate female names
    for (let i = maleCount; i < totalContacts; i++) {
      const contact = existingContacts[i]
      const name = generateUniqueName(existingNames, false)
      nameUpdates.push({ id: contact.id, name, isMale: false })
    }

    // Shuffle the updates to randomize the distribution
    for (let i = nameUpdates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nameUpdates[i], nameUpdates[j]] = [nameUpdates[j], nameUpdates[i]]
    }

    console.log("Updating contact records...")

    // Update contacts table
    for (const update of nameUpdates) {
      await sql.query("UPDATE contacts SET client_name = $1 WHERE id = $2", [update.name, update.id])
    }

    // Update clients table - first clear it
    await sql.query("DELETE FROM clients")

    // Get updated contact data to rebuild clients table
    const updatedContacts = await sql.query(`
      SELECT DISTINCT client_name, category 
      FROM contacts 
      ORDER BY client_name
    `)

    console.log("Rebuilding clients table...")
    for (const contact of updatedContacts) {
      await sql.query("INSERT INTO clients (name, category) VALUES ($1, $2)", [contact.client_name, contact.category])
    }

    // Verify uniqueness
    const duplicateCheck = await sql.query(`
      SELECT client_name, COUNT(*) as count 
      FROM contacts 
      GROUP BY client_name 
      HAVING COUNT(*) > 1
    `)

    const maleNames = nameUpdates.filter((u) => u.isMale).map((u) => u.name)
    const femaleNames = nameUpdates.filter((u) => !u.isMale).map((u) => u.name)

    return NextResponse.json({
      message: "Successfully updated all client names!",
      stats: {
        totalUpdated: nameUpdates.length,
        maleCount: maleNames.length,
        femaleCount: femaleNames.length,
        allUnique: duplicateCheck.length === 0,
      },
      sampleNames: {
        male: maleNames.slice(0, 3),
        female: femaleNames.slice(0, 3),
      },
    })
  } catch (error) {
    console.error("Failed to update client names:", error)
    return NextResponse.json(
      { error: `Failed to update client names: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
