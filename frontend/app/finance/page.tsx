"use client"

import { useEffect, useState, type ComponentType, type SVGProps } from "react"
import { 
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Container from '@/components/Container';
import withAuth from "@/components/withAuth";

interface FinancialMetric {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Completed';
}

interface FinanceData {
  financialMetrics: FinancialMetric[];
  recentTransactions: Transaction[];
}

function FinancePage() {
  const [financeData, setFinanceData] = useState<FinanceData>({
    financialMetrics: [],
    recentTransactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFinanceData() {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call
        const response = await new Promise<FinanceData>((resolve, reject) => {
          setTimeout(() => {
            if (false) { // Always simulate error
              resolve({
                financialMetrics: [
                  {
                    name: 'Total Revenue',
                    value: '$45,231.89',
                    change: '+20.1%',
                    changeType: 'increase',
                    icon: CurrencyDollarIcon,
                  },
                  {
                    name: 'Accounts Receivable',
                    value: '$12,345.67',
                    change: '+5.3%',
                    changeType: 'increase',
                    icon: BanknotesIcon,
                  },
                  {
                    name: 'Accounts Payable',
                    value: '$8,765.43',
                    change: '-2.1%',
                    changeType: 'decrease',
                    icon: CreditCardIcon,
                  },
                  {
                    name: 'Outstanding Invoices',
                    value: '24',
                    change: '-3',
                    changeType: 'decrease',
                    icon: DocumentTextIcon,
                  },
                ],
                recentTransactions: [
                  {
                    id: 1,
                    type: 'Invoice',
                    amount: '$1,234.56',
                    date: '2024-03-15',
                    status: 'Paid',
                  },
                  {
                    id: 2,
                    type: 'Payment',
                    amount: '$2,345.67',
                    date: '2024-03-14',
                    status: 'Completed',
                  },
                  {
                    id: 3,
                    type: 'Invoice',
                    amount: '$3,456.78',
                    date: '2024-03-13',
                    status: 'Pending',
                  },
                ],
              });
            } else {
              reject(new Error("Failed to load finance data. Please check your network."));
            }
          }, 1000); // Simulate network delay
        });

        setFinanceData(response);
      } catch (err: any) {
        console.error("Error fetching finance data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchFinanceData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Skeleton for Financial metrics */}
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          {/* Skeleton for Recent Transactions table */}
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
              Error Loading Finance Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your financial data.
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
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Finance Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your financial metrics and recent transactions
            </p>
          </div>
          <div className="mt-4 sm:ml-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              New Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {financeData.financialMetrics.map((metric) => {
            const Icon = metric.icon
            const ArrowIcon: ComponentType<SVGProps<SVGSVGElement>> =
              metric.changeType === 'increase'
                ? ArrowTrendingUpIcon
                : ArrowTrendingDownIcon
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
              Recent Transactions
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
                          Type
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
                      {financeData.recentTransactions.length > 0 ? (
                        financeData.recentTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {transaction.type}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.amount}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.date}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                transaction.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-500">
                            No recent transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default withAuth(FinancePage);
