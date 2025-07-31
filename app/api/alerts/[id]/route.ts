import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const alertId = Number.parseInt(params.id)

    if (isNaN(alertId)) {
      return NextResponse.json({ error: "Invalid alert ID" }, { status: 400 })
    }

    await sql`
      UPDATE alerts 
      SET resolved_at = CURRENT_TIMESTAMP 
      WHERE id = ${alertId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resolving alert:", error)
    return NextResponse.json({ error: "Failed to resolve alert" }, { status: 500 })
  }
}
