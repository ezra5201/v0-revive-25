import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { clientName, resolvedBy } = body

    if (!clientName) {
      return NextResponse.json({ error: "clientName is required" }, { status: 400 })
    }

    // Update all active alerts for this client
    const result = await sql`
      UPDATE alerts 
      SET 
        status = 'resolved',
        resolved_by = ${resolvedBy || "System"},
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE client_name = ${clientName} 
        AND status = 'active'
      RETURNING id, client_name
    `

    return NextResponse.json({
      message: `Cleared ${result.length} alert(s) for ${clientName}`,
      clearedAlerts: result.length,
    })
  } catch (error) {
    console.error("Failed to clear client alerts:", error)
    return NextResponse.json({ error: "Failed to clear client alerts" }, { status: 500 })
  }
}
