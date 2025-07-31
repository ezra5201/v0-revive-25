import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const alertId = Number.parseInt(params.id)
    const body = await request.json()
    const { status, resolvedBy } = body

    // Validate status
    if (!["active", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update the alert
    const result = await sql`
      UPDATE alerts 
      SET 
        status = ${status},
        resolved_by = ${status !== "active" ? resolvedBy : null},
        resolved_at = ${status !== "active" ? "NOW()" : null},
        updated_at = NOW()
      WHERE id = ${alertId}
      RETURNING id, client_name, status, resolved_by, resolved_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: `Alert ${status}`,
      alert: result[0],
    })
  } catch (error) {
    console.error("Failed to update alert:", error)
    return NextResponse.json(
      { error: `Failed to update alert: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
