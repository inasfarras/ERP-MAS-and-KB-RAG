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
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { ForwardRefExoticComponent, SVGProps } from 'react';

type HeroIcon = ForwardRefExoticComponent<SVGProps<SVGSVGElement>>;

interface Stat {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: any; // Using any for now to resolve type issues
}

interface QuickAction {
  name: string;
  href: string;
  icon: any; // Using any for now to resolve type issues
}

const stats: Stat[] = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Active Orders',
    value: '24',
    change: '+4.3%',
    changeType: 'increase',
    icon: ShoppingCartIcon,
  },
  {
    name: 'Inventory Items',
    value: '1,234',
    change: '-2.1%',
    changeType: 'decrease',
    icon: CubeIcon,
  },
  {
    name: 'Active Projects',
    value: '12',
    change: '+12.5%',
    changeType: 'increase',
    icon: ClipboardDocumentListIcon,
  },
];

const quickActions: QuickAction[] = [
  { name: 'Create Order', href: '/sales/new', icon: ShoppingCartIcon },
  { name: 'Add Inventory', href: '/inventory/new', icon: CubeIcon },
  { name: 'New Project', href: '/projects/new', icon: ClipboardDocumentListIcon },
  { name: 'View Reports', href: '/analytics', icon: ChartBarIcon },
  { name: 'Manage Team', href: '/hr', icon: UserGroupIcon },
];

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
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon: any = stat.icon;
              const ArrowIcon: any = stat.changeType === 'increase' ? ArrowUpIcon : ArrowDownIcon;
              return (
                <div
                  key={stat.name}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stat.value}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <span
                        className={`inline-flex items-center font-medium ${
                          stat.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        <ArrowIcon className="h-4 w-4 mr-1" />
                        {stat.change}
                      </span>
                      <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.name}
                      href={action.href}
                      className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">
                          {action.name}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
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
      </main>
    </>
  )
}
