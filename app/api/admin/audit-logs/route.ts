import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract filter parameters
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const userEmail = searchParams.get("userEmail")
    const action = searchParams.get("action")
    const clientName = searchParams.get("clientName")
    const tableName = searchParams.get("tableName")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    console.log("[v0] Fetching audit logs with filters:", {
      startDate,
      endDate,
      userEmail,
      action,
      clientName,
      tableName,
      page,
      limit,
    })

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

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`
    console.log("[v0] Executing count query:", countQuery)
    console.log("[v0] With params:", params)

    const countResult = await sql.unsafe(countQuery, params)
    console.log("[v0] Count result:", countResult)

    if (!countResult || countResult.length === 0) {
      console.error("[v0] No count result returned - table may not exist")
      return NextResponse.json(
        {
          error: "Audit logs table not found or query failed",
          hint: "Please ensure the audit_logs table has been created by running scripts/create-audit-logs-table.sql",
        },
        { status: 500 },
      )
    }

    const total = Number(countResult[0]?.total || 0)
    console.log("[v0] Total audit logs:", total)

    // Get paginated results
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
        changes,
        created_at
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    console.log("[v0] Executing data query")
    const logs = await sql.unsafe(dataQuery, [...params, limit, offset])
    console.log("[v0] Retrieved logs count:", logs.length)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Failed to fetch audit logs:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Failed to fetch audit logs",
        details: errorMessage,
        hint:
          errorMessage.includes("relation") || errorMessage.includes("does not exist")
            ? "The audit_logs table may not exist. Please run scripts/create-audit-logs-table.sql"
            : "Check server logs for more details",
      },
      { status: 500 },
    )
  }
}
