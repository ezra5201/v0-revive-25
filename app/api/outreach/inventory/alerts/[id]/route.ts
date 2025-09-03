import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const alertId = Number.parseInt(params.id)
    const { is_resolved } = body

    const result = await sql`
      UPDATE outreach_inventory_alerts 
      SET is_resolved = ${is_resolved},
          resolved_at = ${is_resolved ? "CURRENT_TIMESTAMP" : null}
      WHERE id = ${alertId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}
