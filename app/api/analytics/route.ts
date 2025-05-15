import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const report = searchParams.get("report")
    const startDate = searchParams.get("startDate") || "2020-01-01"
    const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0]

    let data

    switch (report) {
      case "sales-by-product":
        data = await executeQuery(
          `
          SELECT 
            p.id as product_id,
            p.sku,
            p.name as product_name,
            p.category,
            SUM(oi.quantity) as quantity_sold,
            SUM(oi.total_price) as total_sales
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.order_date BETWEEN $1 AND $2
          AND o.status != 'cancelled'
          GROUP BY p.id, p.sku, p.name, p.category
          ORDER BY total_sales DESC
        `,
          [startDate, endDate],
        )
        break

      case "sales-by-customer":
        data = await executeQuery(
          `
          SELECT 
            c.id as customer_id,
            c.name as customer_name,
            COUNT(o.id) as order_count,
            SUM(o.total_amount) as total_sales
          FROM orders o
          JOIN customers c ON o.customer_id = c.id
          WHERE o.order_date BETWEEN $1 AND $2
          AND o.status != 'cancelled'
          GROUP BY c.id, c.name
          ORDER BY total_sales DESC
        `,
          [startDate, endDate],
        )
        break

      case "inventory-turnover":
        data = await executeQuery(
          `
          SELECT 
            p.id as product_id,
            p.sku,
            p.name as product_name,
            p.category,
            p.stock_quantity as current_stock,
            COALESCE(SUM(oi.quantity), 0) as quantity_sold,
            CASE 
              WHEN p.stock_quantity > 0 THEN COALESCE(SUM(oi.quantity), 0) / p.stock_quantity
              ELSE 0
            END as turnover_ratio
          FROM products p
          LEFT JOIN order_items oi ON p.id = oi.product_id
          LEFT JOIN orders o ON oi.order_id = o.id AND o.order_date BETWEEN $1 AND $2 AND o.status != 'cancelled'
          GROUP BY p.id, p.sku, p.name, p.category, p.stock_quantity
          ORDER BY turnover_ratio DESC
        `,
          [startDate, endDate],
        )
        break

      case "project-profitability":
        data = await executeQuery(
          `
          SELECT 
            p.id as project_id,
            p.project_code,
            p.name as project_name,
            p.budget,
            COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as revenue,
            COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as expenses,
            COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 0) as profit,
            CASE 
              WHEN p.budget > 0 THEN COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) / p.budget * 100
              ELSE 0
            END as budget_utilization
          FROM projects p
          LEFT JOIN transactions t ON p.id = t.project_id
          GROUP BY p.id, p.project_code, p.name, p.budget
          ORDER BY profit DESC
        `,
          [],
        )
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    return NextResponse.json({
      report,
      startDate,
      endDate,
      data,
    })
  } catch (error) {
    console.error("Error generating analytics report:", error)
    return NextResponse.json({ error: "Failed to generate analytics report" }, { status: 500 })
  }
}
