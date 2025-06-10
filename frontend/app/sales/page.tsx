"use client";

import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Container from '@/components/Container';
import withAuth from '@/components/withAuth';

interface SalesMetric {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface Order {
  id: number;
  customer: string;
  amount: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Cancelled';
}

function SalesPage() {
  const [salesMetrics, setSalesMetrics] = useState<SalesMetric[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalesData() {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call
        const response = await new Promise<any>((resolve, reject) => {
          setTimeout(() => {
            // Simulate success
            if (false) { // Always simulate error
              resolve({
                salesMetrics: [
                  {
                    name: 'Total Sales',
                    value: '$89,231.89',
                    change: '+15.1%',
                    changeType: 'increase',
                    icon: ShoppingCartIcon,
                  },
                  {
                    name: 'Average Order Value',
                    value: '$234.56',
                    change: '+8.3%',
                    changeType: 'increase',
                    icon: CurrencyDollarIcon,
                  },
                  {
                    name: 'Active Customers',
                    value: '1,234',
                    change: '+12.5%',
                    changeType: 'increase',
                    icon: UserGroupIcon,
                  },
                  {
                    name: 'Conversion Rate',
                    value: '3.2%',
                    change: '-0.5%',
                    changeType: 'decrease',
                    icon: ChartBarIcon,
                  },
                ],
                recentOrders: [
                  {
                    id: 1,
                    customer: 'Acme Corp',
                    amount: '$1,234.56',
                    date: '2024-03-15',
                    status: 'Completed',
                  },
                  {
                    id: 2,
                    customer: 'TechStart Inc',
                    amount: '$2,345.67',
                    date: '2024-03-14',
                    status: 'Processing',
                  },
                  {
                    id: 3,
                    customer: 'Global Services',
                    amount: '$3,456.78',
                    date: '2024-03-13',
                    status: 'Completed',
                  },
                ],
              });
            } else {
              // Simulate error
              reject(new Error("Failed to load sales data. Please check your network."));
            }
          }, 1000); // Simulate network delay
        });

        setSalesMetrics(response.salesMetrics);
        setRecentOrders(response.recentOrders);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSalesData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Skeleton for Sales metrics */}
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
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
              Error Loading Sales Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your sales data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Details: {error}</p>
            <p className="mt-2">Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-4">Sales</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {salesMetrics.map((metric) => (
                <div key={metric.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{metric.name}</span>
                    {metric.icon && <metric.icon className="h-5 w-5 text-gray-400" />}
                  </div>
                  <p className="text-lg font-bold">{metric.value}</p>
                  <p className={`text-sm ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentOrders.length === 0 && !isLoading && !error && (
              <p className="text-center text-gray-500 mt-4">No recent orders found.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dive deep into your sales data with interactive charts and reports.</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

export default withAuth(SalesPage); 