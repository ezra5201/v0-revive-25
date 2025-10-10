import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { UpdateOutreachLocationSchema, validateRequest } from "@/lib/validations"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const locationId = Number.parseInt(params.id)

    const validation = validateRequest(UpdateOutreachLocationSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    let result
    if (validatedData.is_active !== undefined) {
      // Toggle active status
      result = await sql`
        UPDATE outreach_locations 
        SET is_active = ${validatedData.is_active}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${locationId}
        RETURNING *
      `
    } else {
      // Update location details
      result = await sql`
        UPDATE outreach_locations 
        SET name = ${validatedData.name}, 
            intersection = ${validatedData.intersection}, 
            address = ${validatedData.address}, 
            notes = ${validatedData.notes}, 
            safety_concerns = ${validatedData.safety_concerns},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${locationId}
        RETURNING *
      `
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const locationId = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM outreach_locations 
      WHERE id = ${locationId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    console.error("Error deleting location:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
