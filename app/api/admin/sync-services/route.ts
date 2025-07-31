import { type NextRequest, NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

interface SyncRequest {
  month?: number
  year?: number
  force?: boolean
}

interface SyncResponse {
  success: boolean
  message: string
  data?: any
  timestamp: string
  duration: number
}

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, number>()

/**
 * Checks rate limiting - max 1 request per minute
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const lastRequest = rateLimitStore.get(clientId)

  if (lastRequest && now - lastRequest < 60000) {
    // 1 minute
    return false
  }

  rateLimitStore.set(clientId, now)
  return true
}

/**
 * Validates authentication using admin API key
 */
function validateAuth(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key")
  const expectedKey = process.env.ADMIN_API_KEY

  if (!expectedKey) {
    console.error("ADMIN_API_KEY environment variable not set")
    return false
  }

  return adminKey === expectedKey
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Authentication check
    if (!validateAuth(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid or missing admin key",
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        } as SyncResponse,
        { status: 401 },
      )
    }

    // Rate limiting check
    const clientId = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded: Maximum 1 request per minute",
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        } as SyncResponse,
        { status: 429 },
      )
    }

    // Parse request body
    let body: SyncRequest = {}
    try {
      body = await request.json()
    } catch (parseError) {
      // Body is optional, continue with defaults
    }

    const { month, year, force } = body

    console.log(`[${new Date().toISOString()}] Sync request received:`, {
      month,
      year,
      force,
      clientId,
    })

    // Call sync function
    const result = await syncMonthlyServiceSummary(month?.toString(), year)

    const response: SyncResponse = {
      success: result.success,
      message: result.success
        ? `Successfully synced ${result.processedRecords} services for ${result.targetYear}-${result.targetMonth.toString().padStart(2, "0")}`
        : `Sync failed with ${result.errors.length} errors`,
      data: {
        processedRecords: result.processedRecords,
        targetMonth: result.targetMonth,
        targetYear: result.targetYear,
        syncDuration: result.duration,
        errors: result.errors,
        details: result.details,
        force,
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    }

    const statusCode = result.success ? 200 : 500

    console.log(`[${new Date().toISOString()}] Sync completed:`, {
      success: result.success,
      processedRecords: result.processedRecords,
      duration: result.duration,
      errors: result.errors.length,
    })

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sync API error:`, error)

    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error}`,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      } as SyncResponse,
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Method not allowed. Use POST to trigger sync.",
      timestamp: new Date().toISOString(),
      duration: 0,
    } as SyncResponse,
    { status: 405 },
  )
}
