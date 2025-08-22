import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

/* ------------------------------------------------------------------ */
/* GET /api/alerts - return all active alerts                         */
/* ------------------------------------------------------------------ */
export async function GET() {
  if (!sql) {
    return NextResponse.json({ alerts: [] })
  }

  try {
    /* auto-expire at the start of each request */
    await sql`
      UPDATE alerts
         SET status     = 'expired',
             updated_at = NOW()
       WHERE status     = 'active'
         AND expires_at <= CURRENT_DATE;
    `

    const rows = await sql`
      SELECT id, contact_id, client_name, provider_name,
             alert_type, alert_details, severity,
             status, expires_at, created_at, updated_at
        FROM alerts
       WHERE status = 'active'
       ORDER BY created_at DESC
    `

    return NextResponse.json({ alerts: rows })
  } catch (err: any) {
    console.error("alerts GET failed:", err)

    // Return a proper JSON error response instead of letting it bubble up
    return NextResponse.json(
      {
        alerts: [],
        error: "Failed to fetch alerts",
        message: err.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/alerts - create a new alert                              */
/* ------------------------------------------------------------------ */
export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const contactId = body.contactId ?? null
    const clientName = (body.clientName || "").trim()
    const provider = (body.providerName || "").trim()
    const details = (body.alertDetails || "Alert flagged - no details provided").trim()
    const alertType = body.alertType ?? "behavioral"
    const severity = body.severity ?? "medium"

    if (!clientName || !provider) {
      return NextResponse.json({ error: "clientName and providerName are required" }, { status: 400 })
    }

    /* one active alert per client per day */
    const dup = await sql`
      SELECT 1 FROM alerts
       WHERE client_name      = ${clientName}
         AND status           = 'active'
         AND DATE(created_at) = CURRENT_DATE
       LIMIT 1
    `
    if (dup.length) {
      return NextResponse.json({ error: "An active alert already exists for this client today" }, { status: 400 })
    }

    const [alert] = await sql`
      INSERT INTO alerts (
        contact_id, client_name, provider_name,
        alert_type, alert_details, severity,
        status, expires_at, created_at, updated_at
      )
      VALUES (
        ${contactId}, ${clientName}, ${provider},
        ${alertType}, ${details},   ${severity},
        'active', CURRENT_DATE + INTERVAL '1 day', NOW(), NOW()
      )
      RETURNING *
    `

    /* link alert to contacts row if provided */
    if (contactId) {
      await sql`
        UPDATE contacts
           SET alert_id   = ${alert.id},
               updated_at = NOW()
         WHERE id = ${contactId}
      `
    }

    return NextResponse.json({ alert })
  } catch (err: any) {
    console.error("alerts POST failed:", err)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}
