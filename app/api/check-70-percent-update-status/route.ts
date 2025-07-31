import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  if (!sql) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
  }

  try {
    // Check if we have a record of the 70% update being completed
    // We'll look for a specific pattern that indicates the update was run

    // First, check if there's a flag in the database (we'll create a simple settings table)
    try {
      const flagResult = await sql`
        SELECT value FROM app_settings WHERE key = 'seventy_percent_update_completed'
      `

      if (flagResult.length > 0 && flagResult[0].value === "true") {
        return NextResponse.json({
          completed: true,
          reason: "Flag found in database",
        })
      }
    } catch (error) {
      // Settings table might not exist yet, continue with other checks
    }

    // Check if 70% update has been applied
    const result = await sql`
      SELECT COUNT(*) as count
      FROM clients 
      WHERE name LIKE '%70%'
    `

    const has70PercentUpdate = Number.parseInt(result[0].count) > 0

    // Get all contacts to analyze name patterns
    const contacts = await sql`
      SELECT DISTINCT client_name 
      FROM contacts 
      ORDER BY client_name
    `

    if (contacts.length === 0) {
      return NextResponse.json({ completed: false, reason: "No contacts found" })
    }

    // Check for high name diversity (indicating updates have been made)
    const uniqueNames = contacts.map((c) => c.client_name)
    const totalUniqueNames = uniqueNames.length

    // Check for common American first names that indicate name generation
    const americanFirstNames = [
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
    ]

    let americanNameCount = 0
    uniqueNames.forEach((fullName) => {
      const firstName = fullName.split(" ")[0]
      if (americanFirstNames.includes(firstName)) {
        americanNameCount++
      }
    })

    const americanNamePercentage = (americanNameCount / totalUniqueNames) * 100

    // If we have a high percentage of American names and good diversity,
    // assume the 70% update was completed
    const hasHighAmericanNamePercentage = americanNamePercentage > 60
    const hasGoodDiversity = totalUniqueNames > 50

    const completed = hasHighAmericanNamePercentage && hasGoodDiversity

    return NextResponse.json({
      completed,
      reason: completed ? "High American name percentage and good diversity detected" : "Insufficient indicators",
      statistics: {
        totalUniqueNames,
        americanNameCount,
        americanNamePercentage: Math.round(americanNamePercentage),
        hasHighAmericanNamePercentage,
        hasGoodDiversity,
        has70PercentUpdate,
        count: Number.parseInt(result[0].count),
      },
    })
  } catch (error) {
    console.error("Error checking 70% update status:", error)
    return NextResponse.json({ error: "Failed to check update status" }, { status: 500 })
  }
}
