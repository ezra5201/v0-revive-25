import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const itemId = Number.parseInt(params.id)
    const { item_name, category, current_stock, minimum_threshold, unit_type, cost_per_unit, supplier, notes } = body

    const result = await sql`
      UPDATE outreach_inventory 
      SET item_name = ${item_name},
          category = ${category},
          current_stock = ${current_stock},
          minimum_threshold = ${minimum_threshold},
          unit_type = ${unit_type},
          cost_per_unit = ${cost_per_unit || null},
          supplier = ${supplier || null},
          notes = ${notes || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
  }
}
