import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { CreateOutreachLocationSchema, validateRequest } from "@/lib/validations"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const locations = await sql`
      SELECT 
        id,
        name,
        intersection,
        address,
        latitude,
        longitude,
        is_active,
        visit_count,
        last_visited
      FROM outreach_locations 
      WHERE is_active = true 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      ORDER BY visit_count DESC, name ASC
      LIMIT 100
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

    const validation = validateRequest(CreateOutreachLocationSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    const result = await sql`
      INSERT INTO outreach_locations (name, intersection, address, notes, safety_concerns)
      VALUES (${validatedData.name}, ${validatedData.intersection}, ${validatedData.address}, 
              ${validatedData.notes}, ${validatedData.safety_concerns})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}
