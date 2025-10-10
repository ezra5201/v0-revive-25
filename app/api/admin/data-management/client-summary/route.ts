import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const { client_name } = await request.json()

    if (!client_name || typeof client_name !== "string") {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    // Get counts of all data for this client
    const [
      clientInfo,
      contactsCount,
      cmCheckinsCount,
      cmGoalsCount,
      otCheckinsCount,
      otGoalsCount,
      intakeFormsCount,
      alertsCount,
    ] = await Promise.all([
      sql`SELECT * FROM clients WHERE name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM contacts WHERE client_name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM cm_checkins WHERE client_name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM cm_goals WHERE client_name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM ot_checkins WHERE client_name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM ot_goals WHERE client_name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM intake_forms i 
          JOIN clients c ON i.client_id = c.id 
          WHERE c.name = ${client_name}`,
      sql`SELECT COUNT(*) as count FROM alerts WHERE client_name = ${client_name}`,
    ])

    if (clientInfo.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Log the view action
    await auditLog({
      action: "VIEW",
      tableName: "clients",
      recordId: clientInfo[0].id.toString(),
      clientName: client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        action: "viewed_for_deletion_preview",
      },
    })

    return NextResponse.json({
      client: clientInfo[0],
      data_summary: {
        contacts: Number(contactsCount[0].count),
        cm_checkins: Number(cmCheckinsCount[0].count),
        cm_goals: Number(cmGoalsCount[0].count),
        ot_checkins: Number(otCheckinsCount[0].count),
        ot_goals: Number(otGoalsCount[0].count),
        intake_forms: Number(intakeFormsCount[0].count),
        alerts: Number(alertsCount[0].count),
      },
    })
  } catch (error) {
    console.error("Failed to fetch client summary:", error)
    return NextResponse.json(
      { error: `Failed to fetch client summary: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
