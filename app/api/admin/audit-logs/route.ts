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

    // Build WHERE conditions array
    const conditions: string[] = ["1=1"] // Always true condition to simplify AND logic

    if (startDate) {
      conditions.push(`timestamp >= '${startDate}'::timestamptz`)
    }
    if (endDate) {
      conditions.push(`timestamp <= '${endDate}'::timestamptz`)
    }
    if (userEmail) {
      conditions.push(`user_email ILIKE '%${userEmail.replace(/'/g, "''")}%'`)
    }
    if (action) {
      conditions.push(`action = '${action.replace(/'/g, "''")}'`)
    }
    if (clientName) {
      conditions.push(`client_name ILIKE '%${clientName.replace(/'/g, "''")}%'`)
    }
    if (tableName) {
      conditions.push(`table_name = '${tableName.replace(/'/g, "''")}'`)
    }

    const whereClause = conditions.join(" AND ")

    // Get total count for pagination
    console.log("[v0] Executing count query with WHERE:", whereClause)

    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM audit_logs 
      WHERE ${sql.unsafe(whereClause)}
    `

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
    console.log("[v0] Executing data query with limit:", limit, "offset:", offset)

    const logs = await sql`
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
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    console.log("[v0] Retrieved logs count:", logs?.length || 0)

    const logsArray = Array.isArray(logs) ? logs : []

    return NextResponse.json({
      logs: logsArray,
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
