import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

/**
 * GET /api/analytics/services/trends?service=Food
 * Returns:
 * {
 *   service: "Food",
 *   trends: [
 *     { month: "2024-01", monthLabel: "Jan 2024", requested: 10, provided: 8, completionRate: 80 },
 *     …
 *   ],
 *   summary: { totalRequested: 120, totalProvided: 95, averageCompletionRate: 79 }
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const service = (searchParams.get("service") || "Food").trim()
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Math.max(Number(limitParam), 1) : null

    // Add debugging
    console.log(`Fetching trends for service: "${service}"`)

    /* ---------- optionally-limited query ---------- */
    const rows = await sql<
      {
        service_type: string
        month: Date
        usage_count: number
      }[]
    >`
      SELECT 
        service_type,
        DATE_TRUNC('month', contact_date) as month,
        COUNT(*) as usage_count
      FROM contacts
      WHERE contact_date >= CURRENT_DATE - INTERVAL '6 months'
        AND service_type IS NOT NULL
        AND LOWER(service_type) = LOWER(${service})
      GROUP BY service_type, DATE_TRUNC('month', contact_date)
      ORDER BY month, service_type
      ${limit ? `LIMIT ${limit}` : ""}
    `

    /* ---------- shape for the dashboard ---------- */
    const trends = rows.map((r) => {
      const date = new Date(r.month)
      return {
        serviceType: r.service_type,
        month: date.toISOString().split("T")[0],
        monthLabel: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        usageCount: r.usage_count,
      }
    })

    /* ---------- summary stats ---------- */
    const summary = {
      totalUsageCount: trends.reduce((t, m) => t + m.usageCount, 0),
    }

    /* ---------- always succeed with at least an empty data set ---------- */
    return NextResponse.json({ service, trends, summary })
  } catch (err) {
    console.error("Service-trends API error:", err)
    return NextResponse.json(
      {
        error: "Failed to fetch service trends",
        service: "Unknown",
        trends: [],
        summary: { totalUsageCount: 0 },
      },
      { status: 500 },
    )
  }
}
