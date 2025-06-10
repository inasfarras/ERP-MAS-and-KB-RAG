"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { MoveRight } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
