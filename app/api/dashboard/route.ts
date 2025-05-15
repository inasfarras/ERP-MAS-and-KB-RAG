import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Create a mock response since we don't have the actual data yet
    // This will match the structure expected by the frontend
    const mockData = {
      financialMetrics: {
        total_revenue: 8248.75,
        open_orders: 2,
        low_stock_items: 3,
        active_projects: 3,
      },
      recentAlerts: [
        {
          id: 1,
          event_type: "alert",
          description: "Low stock for product P004 (Control Panel). Current stock: 25, Reorder level: 10",
          status: "pending",
          severity: "medium",
          created_at: new Date().toISOString(),
          entity_type: "order",
        },
        {
          id: 2,
          event_type: "notification",
          description: "Order ORD-2023-003 has been shipped",
          status: "resolved",
          severity: "low",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          entity_type: "order",
        },
        {
          id: 3,
          event_type: "alert",
          description: "Payment overdue for invoice INV-2023-001",
          status: "pending",
          severity: "high",
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          entity_type: "order",
        },
      ],
      salesTrend: [
        { month: "2023-01", order_count: 1, total_sales: 2499.5 },
        { month: "2023-02", order_count: 1, total_sales: 5749.25 },
        { month: "2023-03", order_count: 1, total_sales: 12499.75 },
        { month: "2023-04", order_count: 1, total_sales: 3999.6 },
        { month: "2023-05", order_count: 1, total_sales: 1749.85 },
      ],
    }

    // Try to get actual data from the database if possible
    try {
      // Get key metrics for dashboard
      const financialMetricsResult = await executeQuery(`
        SELECT 
          (SELECT SUM(amount) FROM transactions WHERE type = 'credit' AND account_id = (SELECT id FROM accounts WHERE account_code = '4000')) as total_revenue,
          (SELECT COUNT(*) FROM orders WHERE status = 'processing' OR status = 'confirmed') as open_orders,
          (SELECT COUNT(*) FROM products WHERE stock_quantity <= reorder_level) as low_stock_items,
          (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects
      `)

      if (financialMetricsResult && financialMetricsResult.length > 0) {
        mockData.financialMetrics = financialMetricsResult[0]
      }

      // Get recent alerts
      const recentAlertsResult = await executeQuery(`
        SELECT 
          pe.id, 
          pe.event_type, 
          pe.description, 
          pe.status, 
          pe.severity, 
          pe.created_at,
          CASE 
            WHEN pe.order_id IS NOT NULL THEN 'order'
            WHEN pe.purchase_order_id IS NOT NULL THEN 'purchase_order'
            WHEN pe.project_id IS NOT NULL THEN 'project'
            WHEN pe.shipment_id IS NOT NULL THEN 'shipment'
            ELSE 'other'
          END as entity_type
        FROM process_events pe
        ORDER BY pe.created_at DESC
        LIMIT 5
      `)

      if (recentAlertsResult && recentAlertsResult.length > 0) {
        mockData.recentAlerts = recentAlertsResult
      }

      // Get sales trend
      const salesTrendResult = await executeQuery(`
        SELECT 
          TO_CHAR(order_date, 'YYYY-MM') as month,
          COUNT(*) as order_count,
          SUM(total_amount) as total_sales
        FROM orders
        WHERE order_date >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(order_date, 'YYYY-MM')
        ORDER BY month
      `)

      if (salesTrendResult && salesTrendResult.length > 0) {
        mockData.salesTrend = salesTrendResult
      }
    } catch (dbError) {
      console.error("Database query error:", dbError)
      // Continue with mock data if database queries fail
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
