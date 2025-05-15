'use client'

import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Inventory() {
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-data'],
    queryFn: async () => {
      const response = await axios.get('/api/inventory/summary')
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
      
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{inventoryData?.totalProducts || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{inventoryData?.lowStockItems || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${inventoryData?.totalValue || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Suppliers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{inventoryData?.activeSuppliers || 0}</dd>
          </div>
        </Card>
      </div>

      {/* Stock Levels */}
      <Card>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Stock Levels</h3>
          <div className="mt-4">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Product</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reorder Level</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventoryData?.stockLevels?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">{item.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.sku}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.currentStock}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.reorderLevel}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              item.currentStock > item.reorderLevel ? 'bg-green-50 text-green-700' :
                              item.currentStock === 0 ? 'bg-red-50 text-red-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}>
                              {item.currentStock > item.reorderLevel ? 'In Stock' :
                               item.currentStock === 0 ? 'Out of Stock' :
                               'Low Stock'}
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
      </Card>
    </div>
  )
} 