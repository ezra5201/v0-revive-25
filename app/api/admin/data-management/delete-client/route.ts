import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const { client_name, confirmation_name } = await request.json()

    // Validate inputs
    if (!client_name || typeof client_name !== "string") {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    if (client_name !== confirmation_name) {
      return NextResponse.json({ error: "Confirmation name does not match" }, { status: 400 })
    }

    // Check if client exists
    const clientInfo = await sql`SELECT * FROM clients WHERE name = ${client_name}`
    if (clientInfo.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const client = clientInfo[0]
    const userEmail = getUserFromRequest(request)

    // Get counts before deletion for audit log
    const [contactsCount, cmCheckinsCount, cmGoalsCount, otCheckinsCount, otGoalsCount, intakeFormsCount, alertsCount] =
      await Promise.all([
        sql`SELECT COUNT(*) as count FROM contacts WHERE client_name = ${client_name}`,
        sql`SELECT COUNT(*) as count FROM cm_checkins WHERE client_name = ${client_name}`,
        sql`SELECT COUNT(*) as count FROM cm_goals WHERE client_name = ${client_name}`,
        sql`SELECT COUNT(*) as count FROM ot_checkins WHERE client_name = ${client_name}`,
        sql`SELECT COUNT(*) as count FROM ot_goals WHERE client_name = ${client_name}`,
        sql`SELECT COUNT(*) as count FROM intake_forms i JOIN clients c ON i.client_id = c.id WHERE c.name = ${client_name}`,
        sql`SELECT COUNT(*) as count FROM alerts WHERE client_name = ${client_name}`,
      ])

    const deletionSummary = {
      client_id: client.id,
      client_name: client_name,
      records_deleted: {
        contacts: Number(contactsCount[0].count),
        cm_checkins: Number(cmCheckinsCount[0].count),
        cm_goals: Number(cmGoalsCount[0].count),
        ot_checkins: Number(otCheckinsCount[0].count),
        ot_goals: Number(otGoalsCount[0].count),
        intake_forms: Number(intakeFormsCount[0].count),
        alerts: Number(alertsCount[0].count),
      },
      deleted_by: userEmail,
      deleted_at: new Date().toISOString(),
    }

    // Delete all associated data (in proper order due to foreign keys)
    await sql`DELETE FROM cm_goal_progress WHERE goal_id IN (SELECT id FROM cm_goals WHERE client_name = ${client_name})`
    await sql`DELETE FROM ot_goal_progress WHERE goal_id IN (SELECT id FROM ot_goals WHERE client_name = ${client_name})`
    await sql`DELETE FROM cm_goals WHERE client_name = ${client_name}`
    await sql`DELETE FROM ot_goals WHERE client_name = ${client_name}`
    await sql`DELETE FROM cm_checkins WHERE client_name = ${client_name}`
    await sql`DELETE FROM ot_checkins WHERE client_name = ${client_name}`
    await sql`DELETE FROM alerts WHERE client_name = ${client_name}`
    await sql`DELETE FROM intake_forms WHERE client_id = ${client.id}`
    await sql`DELETE FROM contacts WHERE client_name = ${client_name}`

    // Soft delete the client record
    await sql`
      UPDATE clients 
      SET soft_deleted = true, deleted_at = NOW(), deleted_by = ${userEmail}
      WHERE id = ${client.id}
    `

    // Log the deletion
    await auditLog({
      action: "DELETE",
      tableName: "clients",
      recordId: client.id.toString(),
      clientName: client_name,
      userEmail: userEmail,
      ipAddress: getIpFromRequest(request),
      changes: deletionSummary,
    })

    return NextResponse.json({
      success: true,
      message: `All data for client "${client_name}" has been permanently deleted`,
      summary: deletionSummary,
    })
  } catch (error) {
    console.error("Failed to delete client data:", error)
    return NextResponse.json(
      { error: `Failed to delete client data: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
