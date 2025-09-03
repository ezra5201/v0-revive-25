import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const inventory = await sql`
      SELECT * FROM outreach_inventory 
      WHERE is_active = true
      ORDER BY 
        CASE 
          WHEN current_stock = 0 THEN 1
          WHEN current_stock <= minimum_threshold THEN 2
          ELSE 3
        END,
        item_name ASC
    `

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { item_name, category, current_stock, minimum_threshold, unit_type, cost_per_unit, supplier, notes } = body

    const result = await sql`
      INSERT INTO outreach_inventory (
        item_name, 
        category, 
        current_stock, 
        minimum_threshold, 
        unit_type, 
        cost_per_unit, 
        supplier, 
        notes,
        last_restocked
      )
      VALUES (
        ${item_name}, 
        ${category}, 
        ${current_stock}, 
        ${minimum_threshold}, 
        ${unit_type}, 
        ${cost_per_unit || null}, 
        ${supplier || null}, 
        ${notes || null},
        ${current_stock > 0 ? "CURRENT_DATE" : null}
      )
      RETURNING *
    `

    // Check if we need to create alerts
    const item = result[0]
    if (item.current_stock <= item.minimum_threshold) {
      const alertType = item.current_stock === 0 ? "out_of_stock" : "low_stock"
      const alertMessage =
        item.current_stock === 0
          ? `${item.item_name} is out of stock`
          : `${item.item_name} is running low (${item.current_stock} ${item.unit_type} remaining)`

      await sql`
        INSERT INTO outreach_inventory_alerts (inventory_item_id, alert_type, alert_message)
        VALUES (${item.id}, ${alertType}, ${alertMessage})
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
}
