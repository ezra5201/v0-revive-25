import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get table statistics
    const tableStats = await sql`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    `

    // Get database size
    const dbSize = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `

    // Get table sizes
    const tableSizes = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY size_bytes DESC
    `

    return NextResponse.json({
      tableStats,
      databaseSize: dbSize[0]?.size || "Unknown",
      tableSizes,
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json({ error: "Failed to fetch database statistics" }, { status: 500 })
  }
}
