import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const itemId = Number.parseInt(params.id)
    const { adjustment_type, quantity, notes } = body

    // Get current item
    const currentItem = await sql`
      SELECT * FROM outreach_inventory WHERE id = ${itemId}
    `

    if (currentItem.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const item = currentItem[0]
    let newStock = item.current_stock

    // Calculate new stock based on adjustment type
    switch (adjustment_type) {
      case "restock":
        newStock = item.current_stock + quantity
        break
      case "usage":
      case "loss":
        newStock = Math.max(0, item.current_stock - quantity)
        break
      case "correction":
        newStock = quantity
        break
    }

    // Update stock
    const result = await sql`
      UPDATE outreach_inventory 
      SET current_stock = ${newStock},
          last_restocked = ${adjustment_type === "restock" ? "CURRENT_DATE" : item.last_restocked},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId}
      RETURNING *
    `

    // Create or resolve alerts based on new stock level
    if (newStock <= item.minimum_threshold) {
      const alertType = newStock === 0 ? "out_of_stock" : "low_stock"
      const alertMessage =
        newStock === 0
          ? `${item.item_name} is out of stock`
          : `${item.item_name} is running low (${newStock} ${item.unit_type} remaining)`

      // Check if alert already exists
      const existingAlert = await sql`
        SELECT id FROM outreach_inventory_alerts 
        WHERE inventory_item_id = ${itemId} AND is_resolved = false
      `

      if (existingAlert.length === 0) {
        await sql`
          INSERT INTO outreach_inventory_alerts (inventory_item_id, alert_type, alert_message)
          VALUES (${itemId}, ${alertType}, ${alertMessage})
        `
      }
    } else {
      // Resolve any existing alerts if stock is now above threshold
      await sql`
        UPDATE outreach_inventory_alerts 
        SET is_resolved = true, resolved_at = CURRENT_TIMESTAMP
        WHERE inventory_item_id = ${itemId} AND is_resolved = false
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return NextResponse.json({ error: "Failed to adjust inventory" }, { status: 500 })
  }
}
