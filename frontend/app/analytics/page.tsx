"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Container from '@/components/Container';
import withAuth from "@/components/withAuth";

interface AnalyticMetric {
  name: string;
  value: string;
}

interface AnalyticsData {
  salesMetrics: AnalyticMetric[];
  financialMetrics: AnalyticMetric[];
  inventoryMetrics: AnalyticMetric[];
}

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    salesMetrics: [],
    financialMetrics: [],
    inventoryMetrics: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await new Promise<AnalyticsData>((resolve, reject) => {
          setTimeout(() => {
            if (false) { // Always simulate error
              resolve({
                salesMetrics: [
                  { name: 'Total Sales', value: '$95,000' },
                  { name: 'Customers Acquired', value: '500' },
                ],
                financialMetrics: [
                  { name: 'Profit Margin', value: '25%' },
                  { name: 'Operating Expenses', value: '$15,000' },
                ],
                inventoryMetrics: [
                  { name: 'Stock Turnover', value: '4x' },
                  { name: 'Low Stock Alerts', value: '10' },
                ],
              });
            } else {
              reject(new Error("Failed to load analytics data. Please check your network."));
            }
          }, 1000);
        });
        setAnalyticsData(response);
      } catch (err: any) {
        console.error("Error fetching analytics data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton for Analytics cards */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              Error Loading Analytics Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your analytics data.
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
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Analyze your sales data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analyticsData.salesMetrics.map(metric => (
                <li key={metric.name} className="flex justify-between items-center">
                  <span>{metric.name}</span>
                  <span className="font-semibold">{metric.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Financial Analytics</CardTitle>
            <CardDescription>Analyze your financial data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analyticsData.financialMetrics.map(metric => (
                <li key={metric.name} className="flex justify-between items-center">
                  <span>{metric.name}</span>
                  <span className="font-semibold">{metric.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Analytics</CardTitle>
            <CardDescription>Analyze your inventory data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analyticsData.inventoryMetrics.map(metric => (
                <li key={metric.name} className="flex justify-between items-center">
                  <span>{metric.name}</span>
                  <span className="font-semibold">{metric.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

export default withAuth(AnalyticsPage); 