import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  return NextResponse.json({
    financialMetrics: {
      total_revenue: 45231.89,
      open_orders: 24,
      low_stock_items: 12,
      active_projects: 5,
    },
    recentAlerts: [
      { id: 1, message: 'Low stock on item: Widget A', date: '2024-03-15' },
      { id: 2, message: 'New order received from Acme Corp', date: '2024-03-14' },
    ],
    salesTrend: [
      { month: 'Jan', total_sales: 10000, order_count: 20 },
      { month: 'Feb', total_sales: 12000, order_count: 22 },
      { month: 'Mar', total_sales: 15000, order_count: 24 },
    ],
  })
}
