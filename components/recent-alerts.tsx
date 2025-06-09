"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock, Package, ShoppingCart, Truck, DollarSign } from "lucide-react"

interface Alert {
  id: number
  event_type: string
  description: string
  status: string
  severity: string
  created_at: string
  entity_type: string
}

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("http://localhost:8000/api/dashboard")
        const data = await response.json()
        setAlerts(data.recentAlerts || [])
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "inventory":
      case "product":
        return <Package className="h-4 w-4" />
      case "shipment":
        return <Truck className="h-4 w-4" />
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "payment":
      case "invoice":
        return <DollarSign className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading alerts...</div>
  }

  if (alerts.length === 0) {
    return <div className="text-center p-4 text-gray-500">No alerts found</div>
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start p-3 rounded-md bg-gray-50">
          <div className={`p-2 rounded-full mr-3 ${getSeverityColor(alert.severity)}`}>
            {getIcon(alert.entity_type)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.description}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(alert.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
