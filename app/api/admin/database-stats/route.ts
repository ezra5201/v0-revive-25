import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get table statistics
    const stats = await sql`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `

    // Get database size
    const sizeResult = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
    `

    return NextResponse.json({
      success: true,
      stats,
      databaseSize: sizeResult[0]?.database_size || "Unknown",
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch database statistics" }, { status: 500 })
  }
}
