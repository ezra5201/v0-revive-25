import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const locations = await sql`
      SELECT * FROM outreach_locations 
      ORDER BY is_active DESC, name ASC
    `

    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, intersection, address, notes, safety_concerns } = body

    const result = await sql`
      INSERT INTO outreach_locations (name, intersection, address, notes, safety_concerns)
      VALUES (${name}, ${intersection}, ${address || null}, ${notes || null}, ${safety_concerns || null})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}
