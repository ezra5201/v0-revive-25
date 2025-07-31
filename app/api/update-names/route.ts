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

    if (!oldName || !newName) {
      return NextResponse.json({ error: "Both old name and new name are required" }, { status: 400 })
    }

    // Update contacts table
    await sqlClient`
      UPDATE contacts 
      SET client_name = ${newName}
      WHERE client_name = ${oldName}
    `

    // Update clients table
    await sqlClient`
      UPDATE clients 
      SET name = ${newName}
      WHERE name = ${oldName}
    `

    return NextResponse.json({
      success: true,
      message: `Updated client name from "${oldName}" to "${newName}"`,
    })
  } catch (error) {
    console.error("Update names error:", error)
    return NextResponse.json({ error: "Failed to update client name" }, { status: 500 })
  }
}
