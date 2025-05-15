import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const customerId = searchParams.get("customerId")

    let query = `
      SELECT 
        o.id, 
        o.order_number, 
        o.customer_id, 
        c.name as customer_name,
        o.order_date, 
        o.required_date, 
        o.shipped_date, 
        o.status, 
        o.total_amount,
        o.created_at,
        o.updated_at
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND o.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (customerId) {
      query += ` AND o.customer_id = $${paramIndex}`
      params.push(Number.parseInt(customerId))
      paramIndex++
    }

    query += ` ORDER BY o.order_date DESC`

    const orders = await executeQuery(query, params)

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Insert order
      const orderResult = await executeQuery(
        `
        INSERT INTO orders (
          order_number, 
          customer_id, 
          order_date, 
          required_date, 
          status, 
          total_amount
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
        [
          orderData.order_number,
          orderData.customer_id,
          orderData.order_date || new Date(),
          orderData.required_date,
          orderData.status || "draft",
          orderData.total_amount,
        ],
      )

      const orderId = orderResult[0].id

      // Insert order items
      for (const item of orderData.items) {
        await executeQuery(
          `
          INSERT INTO order_items (
            order_id, 
            product_id, 
            quantity, 
            unit_price, 
            discount, 
            total_price
          ) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [orderId, item.product_id, item.quantity, item.unit_price, item.discount || 0, item.total_price],
        )

        // Update inventory
        await executeQuery(
          `
          INSERT INTO inventory_movements (
            product_id, 
            quantity, 
            movement_type, 
            reference
          ) 
          VALUES ($1, $2, $3, $4)
        `,
          [
            item.product_id,
            -item.quantity, // Negative for outgoing
            "out",
            `Order #${orderData.order_number}`,
          ],
        )

        // Update product stock
        await executeQuery(
          `
          UPDATE products 
          SET stock_quantity = stock_quantity - $1 
          WHERE id = $2
        `,
          [item.quantity, item.product_id],
        )

        // Check if reorder level is reached
        const productResult = await executeQuery(
          `
          SELECT stock_quantity, reorder_level 
          FROM products 
          WHERE id = $1
        `,
          [item.product_id],
        )

        const product = productResult[0]

        if (product.stock_quantity <= product.reorder_level) {
          // Create a reorder alert
          await executeQuery(
            `
            INSERT INTO process_events (
              event_type, 
              description, 
              status, 
              severity, 
              order_id
            ) 
            VALUES ($1, $2, $3, $4, $5)
          `,
            [
              "alert",
              `Reorder point reached for product ID ${item.product_id}. Current stock: ${product.stock_quantity}, Reorder level: ${product.reorder_level}`,
              "pending",
              "medium",
              orderId,
            ],
          )
        }
      }

      // Commit transaction
      await executeQuery("COMMIT")

      // Get the complete order with items
      const order = await executeQuery(
        `
        SELECT * FROM orders WHERE id = $1
      `,
        [orderId],
      )

      const items = await executeQuery(
        `
        SELECT * FROM order_items WHERE order_id = $1
      `,
        [orderId],
      )

      return NextResponse.json({
        ...order[0],
        items,
      })
    } catch (error) {
      // Rollback transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
