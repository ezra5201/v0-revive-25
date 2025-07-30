import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

/* ------------------------------------------------------------------ */
/* Ensure the alerts table & required indexes exist  (idempotent)     */
/* ------------------------------------------------------------------ */
async function ensureAlertsTable() {
  if (!sql) return

  /* 1 – table ------------------------------------------------------- */
  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id            SERIAL PRIMARY KEY,
      contact_id    INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
      client_name   VARCHAR(255) NOT NULL,
      provider_name VARCHAR(255) NOT NULL,
      alert_type    VARCHAR(50)  DEFAULT 'behavioral',
      alert_details TEXT         NOT NULL,
      severity      VARCHAR(20)  DEFAULT 'medium',
      status        VARCHAR(20)  DEFAULT 'active',
      resolved_by   VARCHAR(255),
      resolved_at   TIMESTAMP,
      expires_at    DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  /* 2 – indexes ----------------------------------------------------- */
  await sql`CREATE INDEX IF NOT EXISTS idx_alerts_status      ON alerts(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_alerts_client      ON alerts(client_name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_alerts_created_at  ON alerts(created_at)`
  await sql`CREATE INDEX IF NOT EXISTS idx_alerts_contact_id  ON alerts(contact_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_alerts_expires_at  ON alerts(expires_at)`

  /* 3 – contacts.alert_id ------------------------------------------ */
  await sql`
    ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS alert_id INTEGER REFERENCES alerts(id)
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_alert_id ON contacts(alert_id)`
}

/* ------------------------------------------------------------------ */
/* GET /api/alerts - return all active alerts                         */
/* ------------------------------------------------------------------ */
export async function GET() {
  if (!sql) {
    return NextResponse.json({ alerts: [] })
  }

  try {
    await ensureAlertsTable()

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
    return NextResponse.json({ alerts: [] })
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
    await ensureAlertsTable()

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
