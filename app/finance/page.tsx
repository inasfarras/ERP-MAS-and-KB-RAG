"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart } from "@/components/ui/chart"
import { Plus, ArrowUp, ArrowDown, FileText } from "lucide-react"
import Link from "next/link"
import { 
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface FinancialMetric {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: any; // Using any for now to resolve type issues
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Completed';
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

const financialMetrics: FinancialMetric[] = [
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
];

const recentTransactions: Transaction[] = [
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
];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const [transactionsRes, accountsRes] = await Promise.all([
          fetch("http://localhost:8000/api/finance/transactions"),
          fetch("http://localhost:8000/api/finance/accounts"),
        ])

        const transactionsData = await transactionsRes.json()
        const accountsData = await accountsRes.json()

        setTransactions(transactionsData)
        setAccounts(accountsData || [])
      } catch (error) {
        console.error("Error fetching financial data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate financial metrics
  const totalAssets = accounts.filter((a) => a.type === "asset").reduce((sum, account) => sum + account.balance, 0)

  const totalLiabilities = accounts
    .filter((a) => a.type === "liability")
    .reduce((sum, account) => sum + account.balance, 0)

  const totalEquity = accounts.filter((a) => a.type === "equity").reduce((sum, account) => sum + account.balance, 0)

  const totalRevenue = accounts.filter((a) => a.type === "revenue").reduce((sum, account) => sum + account.balance, 0)

  const totalExpenses = accounts.filter((a) => a.type === "expense").reduce((sum, account) => sum + account.balance, 0)

  const netIncome = totalRevenue - totalExpenses

  return (
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
        {financialMetrics.map((metric) => {
          const Icon = metric.icon;
          const ArrowIcon: any = metric.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
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
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {transaction.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {transaction.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              transaction.status === 'Paid'
                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                : transaction.status === 'Pending'
                                ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                            }`}
                          >
                            {transaction.status}
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
  )
}
