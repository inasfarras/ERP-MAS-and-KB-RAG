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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const salesMetrics: SalesMetric[] = [
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
];

const recentOrders: Order[] = [
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
];

function SalesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your sales orders.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage your customers.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and manage invoices.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(SalesPage); 