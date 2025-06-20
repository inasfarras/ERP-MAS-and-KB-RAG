"use client"

import { useEffect, useState, type ComponentType, type SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, AlertTriangle } from "lucide-react"
import { 
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Container from '@/components/Container';
import withAuth from "@/components/withAuth";

interface Product {
  id: number
  sku: string
  name: string
  description: string
  category: string
  unit_price: number
  stock_quantity: number
  reorder_level: number
  reorder_quantity: number
  lead_time_days: number
}

interface InventoryMetric {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface InventoryData {
  inventoryMetrics: InventoryMetric[];
  products: Product[];
}

function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    async function fetchInventoryData() {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (showLowStock) {
          queryParams.append("lowStock", "true");
        }
        if (selectedCategory) {
          queryParams.append("category", selectedCategory);
        }

        // Simulate API call for inventory data
        const response = await new Promise<InventoryData>((resolve, reject) => {
          setTimeout(() => {
            if (false) { // Always simulate error
              resolve({
                inventoryMetrics: [
                  {
                    name: 'Total Items',
                    value: '1,234',
                    change: '+5.2%',
                    changeType: 'increase',
                    icon: CubeIcon,
                  },
                  {
                    name: 'Low Stock Items',
                    value: '23',
                    change: '-2.1%',
                    changeType: 'decrease',
                    icon: ExclamationTriangleIcon,
                  },
                  {
                    name: 'Out of Stock',
                    value: '5',
                    change: '+1.0%',
                    changeType: 'increase',
                    icon: ExclamationTriangleIcon,
                  },
                  {
                    name: 'Total Value',
                    value: '$234,567.89',
                    change: '+8.3%',
                    changeType: 'increase',
                    icon: CubeIcon,
                  },
                ],
                products: [
                  {
                    id: 1,
                    sku: "PROD001",
                    name: "Laptop Pro",
                    description: "High-performance laptop",
                    category: "Electronics",
                    unit_price: 1200.00,
                    stock_quantity: 15,
                    reorder_level: 10,
                    reorder_quantity: 20,
                    lead_time_days: 7,
                  },
                  {
                    id: 2,
                    sku: "PROD002",
                    name: "Wireless Mouse",
                    description: "Ergonomic wireless mouse",
                    category: "Electronics",
                    unit_price: 25.00,
                    stock_quantity: 50,
                    reorder_level: 20,
                    reorder_quantity: 40,
                    lead_time_days: 5,
                  },
                  {
                    id: 3,
                    sku: "PROD003",
                    name: "Mechanical Keyboard",
                    description: "Gaming mechanical keyboard",
                    category: "Electronics",
                    unit_price: 150.00,
                    stock_quantity: 5,
                    reorder_level: 5,
                    reorder_quantity: 10,
                    lead_time_days: 10,
                  },
                  {
                    id: 4,
                    sku: "OFFICE001",
                    name: "Desk Chair",
                    description: "Adjustable office chair",
                    category: "Office Furniture",
                    unit_price: 250.00,
                    stock_quantity: 8,
                    reorder_level: 5,
                    reorder_quantity: 10,
                    lead_time_days: 14,
                  },
                ].filter(p => {
                  if (showLowStock && p.stock_quantity > p.reorder_level) return false;
                  if (selectedCategory && p.category !== selectedCategory) return false;
                  return true;
                }),
              });
            } else {
              reject(new Error("Failed to load inventory data. Please check your network."));
            }
          }, 1000);
        });

        setInventoryMetrics(response.inventoryMetrics);
        setProducts(response.products);

        const uniqueCategories = Array.from(new Set(response.products.map((p: Product) => p.category)));
        setCategories(uniqueCategories as string[]);
      } catch (err: any) {
        console.error("Error fetching inventory data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventoryData();
  }, [showLowStock, selectedCategory]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return 'Out of Stock';
    if (product.stock_quantity <= product.reorder_level) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20';
      case 'Low Stock':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20';
      case 'Out of Stock':
        return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Skeleton for Inventory metrics */}
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              {/* Skeleton for Products table */}
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
              Error Loading Inventory Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your inventory data.
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
              Inventory Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your inventory levels and stock status
            </p>
          </div>
          <div className="mt-4 sm:ml-4 sm:mt-0">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {inventoryMetrics.map((metric) => {
            const Icon = metric.icon;
            const ArrowIcon = metric.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
            return (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <CardTitle className="text-sm font-medium text-gray-500 truncate">
                        {metric.name}
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 pr-4 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lowStockFilter"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="lowStockFilter" className="text-sm font-medium text-gray-700">Low Stock</label>
              </div>
              <select
                className="block w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatCurrency(product.unit_price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(getStockStatus(product))
                            }`}
                          >
                            {getStockStatus(product)}
                          </span>
                        </TableCell>
                        <TableCell>{product.reorder_level}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Reports</CardTitle>
            <CardDescription>Generate and view inventory reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

export default withAuth(InventoryPage);
