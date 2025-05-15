"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart } from "@/components/ui/chart"
import { Plus, ArrowUp, ArrowDown, FileText } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: number
  transaction_date: string
  amount: number
  description: string
  type: string
  account_id: number
  account_name: string
  account_code: string
}

interface Account {
  id: number
  account_code: string
  name: string
  type: string
  balance: number
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const [transactionsRes, accountsRes] = await Promise.all([
          fetch("/api/finance/transactions"),
          fetch("/api/finance/accounts"),
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Generate Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netIncome)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="mb-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View and manage financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No transactions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.account_name} ({transaction.account_code})
                          </TableCell>
                          <TableCell>
                            {transaction.type === "credit" ? (
                              <span className="flex items-center text-green-600">
                                <ArrowUp className="mr-1 h-4 w-4" /> Credit
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600">
                                <ArrowDown className="mr-1 h-4 w-4" /> Debit
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(transaction.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Export Transactions</Button>
              <Button asChild>
                <Link href="/finance/transactions">View All</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage your financial accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading accounts...</div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No accounts found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.account_code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="capitalize">{account.type}</TableCell>
                          <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Revenue and expenses summary</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={[
                    { name: "Revenue", value: totalRevenue },
                    { name: "Expenses", value: totalExpenses },
                    { name: "Net Income", value: netIncome },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={formatCurrency}
                  className="h-full"
                />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Detailed Report
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Assets, liabilities, and equity</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={[
                    { name: "Assets", value: totalAssets },
                    { name: "Liabilities", value: totalLiabilities },
                    { name: "Equity", value: totalEquity },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["green"]}
                  valueFormatter={formatCurrency}
                  className="h-full"
                />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Detailed Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
