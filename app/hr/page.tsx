import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HRPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-4 text-gray-900 dark:text-white">HR Management</h1>
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
              {/* Add overview cards/charts here */}
            </TabsContent>
            <TabsContent value="employees" className="mt-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Employee Directory</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage employee details, roles, and departments.</p>
              {/* Add employee table/list here */}
            </TabsContent>
            <TabsContent value="payroll" className="mt-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Payroll Processing</h2>
              <p className="text-gray-600 dark:text-gray-400">Process payroll, manage salaries, and generate reports.</p>
              {/* Add payroll features here */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 