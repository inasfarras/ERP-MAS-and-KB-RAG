"use client";

import { useEffect, useState } from "react";
import Container from '@/components/Container';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertTriangle } from "lucide-react";

interface RetailRecord {
  id: number;
  invoice_no: string;
  stock_code: string;
  description: string | null;
  quantity: number;
  invoice_date: string;
  unit_price: number;
  customer_id: number | null;
  country: string;
}

function OnlineRetailPage() {
  const [records, setRecords] = useState<RetailRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/retail/records?limit=100`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data = await res.json();
        setRecords(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;
  if (error)
    return (
      <Container className="py-8">
        <Card className="border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" /> Error Loading Retail Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">{error}</CardDescription>
          </CardHeader>
        </Card>
      </Container>
    );

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-6">Online Retail Data (first 100 rows)</h1>
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Stock Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.invoice_no}</TableCell>
                    <TableCell>{rec.stock_code}</TableCell>
                    <TableCell>{rec.description ?? "-"}</TableCell>
                    <TableCell>{rec.quantity}</TableCell>
                    <TableCell>{new Date(rec.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{rec.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{rec.customer_id ?? "-"}</TableCell>
                    <TableCell>{rec.country}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

export default withAuth(OnlineRetailPage); 