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

interface StockItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const inventoryMetrics: InventoryMetric[] = [
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
];

const stockItems: StockItem[] = [
  {
    id: 1,
    name: 'Laptop Pro X1',
    sku: 'LP-X1-2024',
    quantity: 45,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    sku: 'WM-001',
    quantity: 5,
    status: 'Low Stock',
  },
  {
    id: 3,
    name: '4K Monitor',
    sku: 'MN-4K-27',
    quantity: 0,
    status: 'Out of Stock',
  },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const queryParams = new URLSearchParams()
        if (showLowStock) {
          queryParams.append("lowStock", "true")
        }
        if (selectedCategory) {
          queryParams.append("category", selectedCategory)
        }

        const response = await fetch(
          `http://localhost:8000/api/inventory/products?${queryParams}`,
        )
        const data = await response.json()
        setProducts(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category)))
        setCategories(uniqueCategories as string[])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [showLowStock, selectedCategory])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return 'Out of Stock'
    if (product.stock_quantity <= product.reorder_level) return 'Low Stock'
    return 'In Stock'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
      case 'Low Stock':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
      case 'Out of Stock':
        return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
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
          <CardDescription>Manage your inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border rounded-md px-3 py-2 bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button variant={showLowStock ? "default" : "outline"} onClick={() => setShowLowStock(!showLowStock)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.unit_price)}</TableCell>
                        <TableCell className="text-right">{product.stock_quantity}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
