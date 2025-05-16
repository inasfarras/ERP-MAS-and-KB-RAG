import { 
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface SalesMetric {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: any; // Using any for now to resolve type issues
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

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Sales Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your sales performance and recent orders
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            New Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {salesMetrics.map((metric) => {
          const Icon = metric.icon;
          const ArrowIcon = metric.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
          return (
            <div
              key={metric.name}
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
                        {metric.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {metric.value}
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
                      metric.changeType === 'increase'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    <ArrowIcon className="h-4 w-4 mr-1" />
                    {metric.change}
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
            Recent Orders
          </h3>
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {order.customer}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              order.status === 'Completed'
                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                : order.status === 'Processing'
                                ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 