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

    // Test query - fetch just one month of Food data to verify connection
    // const testQuery = await sql<
    //   {
    //     year: number
    //     month: number
    //     total_requested: number
    //     total_provided: number
    //     completion_rate: number
    //   }[]
    // >(
    //   `
    // SELECT
    //   year,
    //   month,
    //   total_requested,
    //   total_provided,
    //   completion_rate
    // FROM   monthly_service_summary
    // WHERE  LOWER(service_name) = LOWER($1)
    // ORDER  BY year DESC, month DESC
    // LIMIT  1;
    // `,
    //   [service],
    // )

    // console.log(`Test query result for ${service}:`, testQuery)

    /* ---------- optionally-limited query ---------- */
    const rows = await sql<
      {
        year: number
        month: number
        total_requested: number
        total_provided: number
        completion_rate: number
      }[]
    >(
      `
    SELECT
      year,
      month,
      total_requested,
      total_provided,
      completion_rate
    FROM   monthly_service_summary
    WHERE  LOWER(service_name) = LOWER($1)
    ORDER  BY year, month
    ${limit ? "LIMIT " + limit : ""}
  `,
      [service],
    )

    /* ---------- shape for the dashboard ---------- */
    const trends = rows.map((r) => {
      const date = new Date(r.year, r.month - 1) // JS months are 0-indexed
      return {
        month: `${r.year}-${String(r.month).padStart(2, "0")}`,
        monthLabel: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        requested: r.total_requested ?? 0,
        provided: r.total_provided ?? 0,
        completionRate: r.completion_rate ?? 0,
      }
    })

    /* ---------- summary stats ---------- */
    const summary = {
      totalRequested: trends.reduce((t, m) => t + m.requested, 0),
      totalProvided: trends.reduce((t, m) => t + m.provided, 0),
      averageCompletionRate:
        trends.length > 0 ? Math.round(trends.reduce((t, m) => t + m.completionRate, 0) / trends.length) : 0,
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
        summary: { totalRequested: 0, totalProvided: 0, averageCompletionRate: 0 },
      },
      { status: 500 },
    )
  }
}
