"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Container from '@/components/Container';
import withAuth from "@/components/withAuth";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";

interface HRMetric {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

interface HRData {
  metrics: HRMetric[];
  employees: Employee[];
}

function HRPage() {
  const [hrData, setHrData] = useState<HRData>({
    metrics: [],
    employees: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHRData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await new Promise<HRData>((resolve, reject) => {
          setTimeout(() => {
            if (false) { // Always simulate error
              resolve({
                metrics: [
                  {
                    name: 'Total Employees',
                    value: '150',
                    change: '+5%',
                    changeType: 'increase',
                    icon: (props: SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a4.5 4.5 0 0 0 2.309-8.424A4.5 4.5 0 0 0 10.5 3.75H7.875A4.5 4.5 0 0 0 3.375 8.25v3.626M18 18.72a4.5 4.5 0 0 1-2.309 8.424A4.5 4.5 0 0 1 10.5 20.25H7.875A4.5 4.5 0 0 1 3.375 15.75v-3.626m0 0a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 2.25 12h-.75m0 0a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 2.25 12" /></svg>,
                  },
                  {
                    name: 'Open Positions',
                    value: '12',
                    change: '+2%',
                    changeType: 'increase',
                    icon: (props: SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
                  },
                  {
                    name: 'Avg. Tenure',
                    value: '3.5 years',
                    change: '+0.1 years',
                    changeType: 'increase',
                    icon: (props: SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V15.75M21 18.75V15.75M9 18.75h6M6 12h.008v.008H6V12zm2.25 0h.008v.008H8.25V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12zM3 8.25h18M3 12h18M3 15.75h18" /></svg>,
                  },
                ],
                employees: [
                  {
                    id: 1,
                    name: 'John Doe',
                    position: 'Software Engineer',
                    department: 'Engineering',
                    status: 'Active',
                  },
                  {
                    id: 2,
                    name: 'Jane Smith',
                    position: 'HR Manager',
                    department: 'Human Resources',
                    status: 'Active',
                  },
                  {
                    id: 3,
                    name: 'Peter Jones',
                    position: 'Financial Analyst',
                    department: 'Finance',
                    status: 'On Leave',
                  },
                ],
              });
            } else {
              reject(new Error("Failed to load HR data. Please check your network."));
            }
          }, 1000);
        });
        setHrData(response);
      } catch (err: any) {
        console.error("Error fetching HR data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHRData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton for HR metrics */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              {/* Skeleton for Employees table */}
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
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
              Error Loading HR Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your HR data.
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
      <h1 className="text-2xl font-bold tracking-tighter mb-4 text-gray-900 dark:text-white">HR Management</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Manage all your human resources operations, from employee records to payroll and recruitment.
      </p>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">HR Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">Key HR metrics and quick insights.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {hrData.metrics.map((metric) => (
                <Card key={metric.name}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500 truncate">
                      {metric.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {metric.icon && <metric.icon className="h-6 w-6 text-gray-400 mr-2" />}
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="employees" className="mt-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Employee Directory</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage employee details, roles, and departments.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {hrData.employees.length > 0 ? (
                    hrData.employees.map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="payroll" className="mt-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Payroll Processing</h2>
            <p className="text-gray-600 dark:text-gray-400">Process payroll, manage salaries, and generate reports.</p>
            <p className="text-gray-500 mt-4">Coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}

export default withAuth(HRPage); 