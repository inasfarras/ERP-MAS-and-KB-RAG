'use client'

import { Card } from '@/components/ui/card'
import { LineChart, BarChart } from '@/components/charts'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard/metrics')
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${metrics?.revenue || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics?.activeProjects || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics?.pendingOrders || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics?.lowStockItems || 0}</dd>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue Trend</h3>
            <div className="mt-4" style={{ height: '300px' }}>
              <LineChart data={metrics?.revenueTrend || []} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Top Products</h3>
            <div className="mt-4" style={{ height: '300px' }}>
              <BarChart data={metrics?.topProducts || []} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 