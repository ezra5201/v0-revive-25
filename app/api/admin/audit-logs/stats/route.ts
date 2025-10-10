import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get summary statistics for the audit logs
    const stats = await sql`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_email) as unique_users,
        COUNT(DISTINCT client_name) as unique_clients,
        COUNT(CASE WHEN action = 'VIEW' THEN 1 END) as view_count,
        COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as create_count,
        COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as update_count,
        COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_count,
        MIN(timestamp) as earliest_log,
        MAX(timestamp) as latest_log
      FROM audit_logs
    `

    // Get top users by activity
    const topUsers = await sql`
      SELECT 
        user_email,
        COUNT(*) as action_count
      FROM audit_logs
      GROUP BY user_email
      ORDER BY action_count DESC
      LIMIT 10
    `

    // Get activity by table
    const tableActivity = await sql`
      SELECT 
        table_name,
        COUNT(*) as action_count,
        COUNT(CASE WHEN action = 'VIEW' THEN 1 END) as views,
        COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
        COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
        COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes
      FROM audit_logs
      GROUP BY table_name
      ORDER BY action_count DESC
    `

    return NextResponse.json({
      summary: stats[0],
      topUsers,
      tableActivity,
    })
  } catch (error) {
    console.error("Failed to fetch audit log stats:", error)
    return NextResponse.json({ error: "Failed to fetch audit log stats" }, { status: 500 })
  }
}
