import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get unique staff members from outreach_runs and outreach_contacts
    const staffFromRuns = await sql`
      SELECT DISTINCT lead_staff as name 
      FROM outreach_runs 
      WHERE lead_staff IS NOT NULL AND lead_staff != ''
    `

    const staffFromContacts = await sql`
      SELECT DISTINCT staff_member as name 
      FROM outreach_contacts 
      WHERE staff_member IS NOT NULL AND staff_member != ''
    `

    // Combine and deduplicate staff names
    const allStaff = new Set([...staffFromRuns.map((s) => s.name), ...staffFromContacts.map((s) => s.name)])

    const staffList = Array.from(allStaff)
      .filter((name) => name && name.trim().length > 0)
      .sort()
      .map((name, index) => ({ id: index + 1, name }))

    return NextResponse.json(staffList)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}
