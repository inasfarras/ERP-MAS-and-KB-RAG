"use client"

import { useEffect, useState, type ComponentType, type SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@tremor/react"
import Container from '@/components/Container'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  CreditCard,
  PlusCircle,
  ClipboardList,
  Settings
} from "lucide-react"
import RecentAlerts from "@/components/recent-alerts"
import { DatabaseExtensionPoint, KGRAGExtensionPoint, MASExtensionPoint } from "@/components/extension-points"
import {
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface Stat {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface QuickAction {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const stats: Stat[] = [
  {
    name: 'Total Revenue',
    value: '$405,091.00',
    change: '+4.75%',
    changeType: 'increase',
    icon: DollarSign,
  },
  {
    name: 'New Customers',
    value: '1,204',
    change: '+15.2%',
    changeType: 'increase',
    icon: Users,
  },
  {
    name: 'Open Orders',
    value: '316',
    change: '-2.5%',
    changeType: 'decrease',
    icon: ShoppingCart,
  },
  {
    name: 'Inventory Value',
    value: '$1,205,091.00',
    change: '+1.2%',
    changeType: 'increase',
    icon: Package,
  },
];

const quickActions: QuickAction[] = [
  { name: 'New Sales Order', href: '/sales/orders/new', icon: PlusCircle },
  { name: 'New Purchase Order', href: '/inventory/purchase-orders/new', icon: PlusCircle },
  { name: 'Enter AP Bill', href: '/finance/bills/new', icon: ClipboardList },
  { name: 'Receive Payment', href: '/finance/payments/new', icon: CreditCard },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

interface FinancialMetrics {
  total_revenue: number
  open_orders: number
  low_stock_items: number
  active_projects: number
}

interface SalesTrendEntry {
  month: string
  total_sales: number
  order_count: number
}

interface DashboardData {
  financialMetrics: FinancialMetrics
  recentAlerts: unknown[]
  salesTrend: SalesTrendEntry[]
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    financialMetrics: {
      total_revenue: 0,
      open_orders: 0,
      low_stock_items: 0,
      active_projects: 0,
    },
    recentAlerts: [],
    salesTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/api/dashboard");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch dashboard data: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        const formattedData = {
          financialMetrics: {
            total_revenue: data.financialMetrics?.total_revenue || 0,
            open_orders: data.financialMetrics?.open_orders || 0,
            low_stock_items: data.financialMetrics?.low_stock_items || 0,
            active_projects: data.financialMetrics?.active_projects || 0,
          },
          recentAlerts: data.recentAlerts || [],
          salesTrend: data.salesTrend || [],
        };
        setDashboardData(formattedData);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Skeleton loading for stats cards */}
          {stats.map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="bg-white shadow rounded-lg mt-6 p-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <Card className="border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your dashboard data. Please ensure the backend server is running.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Details: {error}</p>
            <p className="mt-2">If the issue persists, please try again later or contact support.</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon: ComponentType<SVGProps<SVGSVGElement>> = stat.icon
            const ArrowIcon: ComponentType<SVGProps<SVGSVGElement>> =
              stat.changeType === 'increase' ? ArrowUpIcon : ArrowDownIcon
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
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View all
                    </a>
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
                const Icon: ComponentType<SVGProps<SVGSVGElement>> = action.icon
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
                    className="h-full"
                  />
                </TabsContent>
                <TabsContent value="orders" className="h-80">
                  <BarChart
                    data={dashboardData.salesTrend || []}
                    index="month"
                    categories={["order_count"]}
                    colors={["blue"]}
                    valueFormatter={(value: number) => `${value} orders`}
                    className="h-full"
                  />
                </TabsContent>
                <TabsContent value="inventory" className="h-80">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Inventory chart coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <DatabaseExtensionPoint />
          <MASExtensionPoint />
          <KGRAGExtensionPoint />
        </div>

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
    </Container>
  )
} 