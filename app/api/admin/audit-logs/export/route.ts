import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract filter parameters (same as main route)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const userEmail = searchParams.get("userEmail")
    const action = searchParams.get("action")
    const clientName = searchParams.get("clientName")
    const tableName = searchParams.get("tableName")

    // Build dynamic WHERE clause
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (startDate) {
      conditions.push(`timestamp >= $${paramIndex}::timestamptz`)
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      conditions.push(`timestamp <= $${paramIndex}::timestamptz`)
      params.push(endDate)
      paramIndex++
    }

    if (userEmail) {
      conditions.push(`user_email ILIKE $${paramIndex}`)
      params.push(`%${userEmail}%`)
      paramIndex++
    }

    if (action) {
      conditions.push(`action = $${paramIndex}`)
      params.push(action)
      paramIndex++
    }

    if (clientName) {
      conditions.push(`client_name ILIKE $${paramIndex}`)
      params.push(`%${clientName}%`)
      paramIndex++
    }

    if (tableName) {
      conditions.push(`table_name = $${paramIndex}`)
      params.push(tableName)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get all matching logs (no pagination for export)
    const dataQuery = `
      SELECT 
        id,
        timestamp,
        user_email,
        action,
        table_name,
        record_id,
        client_name,
        ip_address,
        changes
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
    `

    const logs = await sql.unsafe(dataQuery, params)

    // Convert to CSV
    const headers = [
      "ID",
      "Timestamp",
      "User Email",
      "Action",
      "Table Name",
      "Record ID",
      "Client Name",
      "IP Address",
      "Changes",
    ]

    const csvRows = [headers.join(",")]

    for (const log of logs) {
      const row = [
        log.id,
        log.timestamp,
        log.user_email,
        log.action,
        log.table_name,
        log.record_id || "",
        log.client_name || "",
        log.ip_address || "",
        log.changes ? JSON.stringify(log.changes).replace(/"/g, '""') : "",
      ]
      csvRows.push(row.map((field) => `"${field}"`).join(","))
    }

    const csv = csvRows.join("\n")

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `audit-logs-${timestamp}.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Failed to export audit logs:", error)
    return NextResponse.json({ error: "Failed to export audit logs" }, { status: 500 })
  }
}
