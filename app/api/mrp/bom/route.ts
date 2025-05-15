import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Get the BOM items for the product
    const bomItems = await executeQuery(
      `
      SELECT 
        b.id, 
        b.parent_product_id, 
        pp.name as parent_product_name,
        pp.sku as parent_product_sku,
        b.product_id, 
        p.name as product_name,
        p.sku as product_sku,
        p.unit_price,
        p.stock_quantity,
        b.quantity,
        b.created_at,
        b.updated_at
      FROM bom_items b
      JOIN products p ON b.product_id = p.id
      JOIN products pp ON b.parent_product_id = pp.id
      WHERE b.parent_product_id = $1
    `,
      [productId],
    )

    return NextResponse.json(bomItems)
  } catch (error) {
    console.error("Error fetching BOM items:", error)
    return NextResponse.json({ error: "Failed to fetch BOM items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const bomItem = await request.json()

    // Validate required fields
    if (!bomItem.parent_product_id || !bomItem.product_id || !bomItem.quantity) {
      return NextResponse.json({ error: "Parent product ID, product ID, and quantity are required" }, { status: 400 })
    }

    // Insert BOM item
    const result = await executeQuery(
      `
      INSERT INTO bom_items (
        parent_product_id, 
        product_id, 
        quantity
      ) 
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [bomItem.parent_product_id, bomItem.product_id, bomItem.quantity],
    )

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating BOM item:", error)
    return NextResponse.json({ error: "Failed to create BOM item" }, { status: 500 })
  }
}
