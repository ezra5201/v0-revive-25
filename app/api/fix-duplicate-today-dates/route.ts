import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Keep only the most recent contact for each client today
    const result = await sql`
      DELETE FROM contacts 
      WHERE id NOT IN (
        SELECT DISTINCT ON (client_name) id
        FROM contacts
        WHERE contact_date = ${today}
        ORDER BY client_name, created_at DESC
      )
      AND contact_date = ${today}
    `

    return NextResponse.json({
      success: true,
      message: "Fixed duplicate entries for today",
    })
  } catch (error) {
    console.error("Fix duplicates error:", error)
    return NextResponse.json({ error: "Failed to fix duplicate entries" }, { status: 500 })
  }
}
