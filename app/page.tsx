"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"
import {
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Package,
  Workflow,
  Briefcase,
  Layers,
  BarChart2,
  Settings,
  Users,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import DashboardMetrics from "@/components/dashboard-metrics"
import RecentAlerts from "@/components/recent-alerts"
import { DatabaseExtensionPoint, KGRAGExtensionPoint, MASExtensionPoint } from "@/components/extension-points"

export default function Home() {
  const [dashboardData, setDashboardData] = useState<any>({
    financialMetrics: {
      total_revenue: 0,
      open_orders: 0,
      low_stock_items: 0,
      active_projects: 0,
    },
    recentAlerts: [],
    salesTrend: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          console.error("Error fetching dashboard data:", response.statusText)
          return
        }
        const data = await response.json()

        // Ensure the data has the expected structure
        const formattedData = {
          financialMetrics: {
            total_revenue: data.financialMetrics?.total_revenue || 0,
            open_orders: data.financialMetrics?.open_orders || 0,
            low_stock_items: data.financialMetrics?.low_stock_items || 0,
            active_projects: data.financialMetrics?.active_projects || 0,
          },
          recentAlerts: data.recentAlerts || [],
          salesTrend: data.salesTrend || [],
        }

        setDashboardData(formattedData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-gray-900 text-white">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold mb-8">ERP System</h1>
            <nav className="space-y-1">
              <Link href="/" className="flex items-center px-4 py-3 text-sm rounded-md bg-gray-800">
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link href="/finance" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <DollarSign className="mr-3 h-5 w-5" />
                Finance & Accounting
              </Link>
              <Link href="/sales" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <ShoppingCart className="mr-3 h-5 w-5" />
                Sales & Orders
              </Link>
              <Link href="/inventory" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <Package className="mr-3 h-5 w-5" />
                Inventory & Supply Chain
              </Link>
              <Link href="/processes" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <Workflow className="mr-3 h-5 w-5" />
                Business Processes
              </Link>
              <Link href="/projects" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <Briefcase className="mr-3 h-5 w-5" />
                Projects & Jobs
              </Link>
              <Link href="/mrp" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <Layers className="mr-3 h-5 w-5" />
                MRP
              </Link>
              <Link href="/analytics" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                <BarChart2 className="mr-3 h-5 w-5" />
                Business Intelligence
              </Link>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <Link href="/settings" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
                <Link href="/users" className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800">
                  <Users className="mr-3 h-5 w-5" />
                  User Management
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <header className="bg-white shadow">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* Dashboard Content */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <DashboardMetrics
                title="Total Revenue"
                value={formatCurrency(dashboardData.financialMetrics.total_revenue || 0)}
                change="+12.5%"
                trend="up"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <DashboardMetrics
                title="Open Orders"
                value={dashboardData.financialMetrics.open_orders?.toString() || "0"}
                change="+5.3%"
                trend="up"
                icon={<ShoppingCart className="h-5 w-5" />}
              />
              <DashboardMetrics
                title="Low Stock Items"
                value={dashboardData.financialMetrics.low_stock_items?.toString() || "0"}
                change="+2"
                trend="down"
                icon={<Package className="h-5 w-5" />}
              />
              <DashboardMetrics
                title="Active Projects"
                value={dashboardData.financialMetrics.active_projects?.toString() || "0"}
                change="-3"
                trend="neutral"
                icon={<Briefcase className="h-5 w-5" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
              {/* Business Process Alerts */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>Recent business process alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentAlerts />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Alerts
                  </Button>
                </CardFooter>
              </Card>

              {/* Performance Charts */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Financial and operational metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="revenue">
                    <TabsList className="mb-4">
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>
                    <TabsContent value="revenue" className="h-80">
                      <LineChart
                        data={dashboardData.salesTrend || []}
                        index="month"
                        categories={["total_sales"]}
                        colors={["green"]}
                        valueFormatter={(value) => formatCurrency(value)}
                        className="h-full"
                      />
                    </TabsContent>
                    <TabsContent value="orders" className="h-80">
                      <BarChart
                        data={dashboardData.salesTrend || []}
                        index="month"
                        categories={["order_count"]}
                        colors={["blue"]}
                        valueFormatter={(value) => `${value} orders`}
                        className="h-full"
                      />
                    </TabsContent>
                    <TabsContent value="inventory" className="h-80">
                      <PieChart
                        data={[
                          { name: "Raw Materials", value: 35 },
                          { name: "Work in Progress", value: 25 },
                          { name: "Finished Goods", value: 40 },
                        ]}
                        index="name"
                        categories={["value"]}
                        colors={["teal", "amber", "indigo"]}
                        valueFormatter={(value) => `${value}%`}
                        className="h-full"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Extension Points */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <DatabaseExtensionPoint />
              <MASExtensionPoint />
              <KGRAGExtensionPoint />
            </div>

            {/* Module Integration Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Integrated Business Processes</CardTitle>
                <CardDescription>Visualizing cross-module data flows</CardDescription>
              </CardHeader>
              <CardContent className="h-96 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive process flow visualization would render here</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export Data</Button>
                <Button>View Details</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
