import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const lowStock = searchParams.get("lowStock")

    // Try to get products from the database
    try {
      let query = `
        SELECT 
          p.id, 
          p.sku, 
          p.name, 
          p.description, 
          p.category, 
          p.unit_price, 
          p.stock_quantity, 
          p.reorder_level,
          p.reorder_quantity,
          p.lead_time_days,
          p.created_at,
          p.updated_at
        FROM products p
        WHERE 1=1
      `

      const params: any[] = []

      if (category) {
        query += ` AND p.category = $1`
        params.push(category)
      }

      if (lowStock === "true") {
        query += ` AND p.stock_quantity <= p.reorder_level`
      }

      query += ` ORDER BY p.name`

      const products = await executeQuery(query, params)

      return NextResponse.json(products)
    } catch (dbError) {
      console.error("Database query error:", dbError)

      // Return mock data if database query fails
      const mockProducts = [
        {
          id: 1,
          sku: "P001",
          name: "Basic Widget",
          description: "Standard widget for general use",
          category: "Widgets",
          unit_price: 19.99,
          stock_quantity: 150,
          reorder_level: 30,
          reorder_quantity: 100,
          lead_time_days: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          sku: "P002",
          name: "Premium Widget",
          description: "High-quality widget with extended features",
          category: "Widgets",
          unit_price: 39.99,
          stock_quantity: 75,
          reorder_level: 20,
          reorder_quantity: 50,
          lead_time_days: 7,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          sku: "P003",
          name: "Widget Connector",
          description: "Connects multiple widgets together",
          category: "Accessories",
          unit_price: 9.99,
          stock_quantity: 200,
          reorder_level: 50,
          reorder_quantity: 150,
          lead_time_days: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          sku: "P004",
          name: "Control Panel",
          description: "Central control unit for widget systems",
          category: "Electronics",
          unit_price: 149.99,
          stock_quantity: 25,
          reorder_level: 10,
          reorder_quantity: 20,
          lead_time_days: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          sku: "P005",
          name: "Power Supply",
          description: "Standard power supply for widgets",
          category: "Electronics",
          unit_price: 29.99,
          stock_quantity: 100,
          reorder_level: 25,
          reorder_quantity: 75,
          lead_time_days: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // Filter mock data based on search parameters
      let filteredProducts = [...mockProducts]

      if (category) {
        filteredProducts = filteredProducts.filter((p) => p.category === category)
      }

      if (lowStock === "true") {
        filteredProducts = filteredProducts.filter((p) => p.stock_quantity <= p.reorder_level)
      }

      return NextResponse.json(filteredProducts)
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()

    const result = await executeQuery(
      `
      INSERT INTO products (
        sku, 
        name, 
        description, 
        category, 
        unit_price, 
        stock_quantity, 
        reorder_level, 
        reorder_quantity, 
        lead_time_days
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        product.sku,
        product.name,
        product.description,
        product.category,
        product.unit_price,
        product.stock_quantity,
        product.reorder_level,
        product.reorder_quantity,
        product.lead_time_days,
      ],
    )

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
