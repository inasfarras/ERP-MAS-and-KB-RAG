"use client"

import { useEffect, useState, type ComponentType, type SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@tremor/react"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Settings,
  Users,
  AlertTriangle,
  CreditCard,
  PlusCircle,
  ClipboardList,
  MoveRight
} from "lucide-react"
import Link from "next/link"
import RecentAlerts from "@/components/recent-alerts"
import { DatabaseExtensionPoint, KGRAGExtensionPoint, MASExtensionPoint } from "@/components/extension-points"
import { 
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Separator } from "@/components/ui/separator";


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

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    financialMetrics: {
      total_revenue: 0,
      open_orders: 0,
      low_stock_items: 0,
      active_projects: 0,
    },
    recentAlerts: [],
    salesTrend: [],
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("http://localhost:8000/api/dashboard")
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
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="font-bold">ERP-MAS</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/finance" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
              Finance
            </Link>
            <Link href="/sales" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
              Sales
            </Link>
            <Link href="/inventory" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
              Inventory
            </Link>
            <Link href="/hr" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
              HR
            </Link>
            <Link href="/projects" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
              Projects
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </header>
      <main className="container py-12 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              The Modern ERP for Growing Businesses
            </h1>
            <p className="max-w-[600px] text-gray-600 dark:text-gray-400 md:text-xl">
              ERP-MAS is an open-source, modular ERP system designed for flexibility and scalability, integrated with advanced AI capabilities.
            </p>
            <div className="flex gap-4">
              <Link href="/docs">
                <Button>
                  Get Started <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://github.com/your-repo/erp-mas">
                <Button variant="outline">
                  View on GitHub
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              title="Finance & Accounting"
              description="Manage your general ledger, accounts payable/receivable, and financial reporting."
              href="/finance"
            />
            <FeatureCard
              title="Sales & CRM"
              description="Track leads, manage customer relationships, and streamline your sales pipeline."
              href="/sales"
            />
            <FeatureCard
              title="Inventory Management"
              description="Optimize stock levels, manage warehouses, and track inventory movements."
              href="/inventory"
            />
            <FeatureCard
              title="HR Management"
              description="Handle employee records, payroll, and recruitment processes with ease."
              href="/hr"
            />
          </div>
        </div>

        <Separator className="my-16" />

        <div className="text-center">
          <h2 className="text-3xl font-bold">AI-Powered Insights</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Leverage the power of a Multi-Agent System (MAS) and Knowledge-Graph-based RAG (KG-RAG) for intelligent automation and decision-making.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AICapability
            title="Intelligent Automation"
            description="Automate complex business processes using autonomous agents that collaborate to achieve goals."
          />
          <AICapability
            title="Conversational Knowledge Access"
            description="Ask complex questions in natural language and get precise answers from your structured and unstructured data."
          />
          <AICapability
            title="Predictive Analytics"
            description="Forecast sales, predict inventory needs, and identify business trends with AI-driven analytics."
          />
        </div>

        <Separator className="my-16" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </main>
      <footer className="border-t bg-white py-6 dark:bg-gray-950">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-gray-500">&copy; 2024 ERP-MAS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm hover:underline">Terms</Link>
            <Link href="/privacy" className="text-sm hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, href }: { title: string, description: string, href: string }) {
  return (
    <Link href={href}>
      <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-800">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

function AICapability({ title, description }: { title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}
