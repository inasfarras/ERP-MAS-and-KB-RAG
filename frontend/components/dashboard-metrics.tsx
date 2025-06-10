import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import type { ReactNode } from "react"

interface DashboardMetricsProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: ReactNode
}

export default function DashboardMetrics({ title, value, change, trend, icon }: DashboardMetricsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-full p-2 bg-gray-100">{icon}</div>
          <div
            className={`flex items-center ${
              trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"
            }`}
          >
            {trend === "up" && <ArrowUp className="h-4 w-4 mr-1" />}
            {trend === "down" && <ArrowDown className="h-4 w-4 mr-1" />}
            {trend === "neutral" && <Minus className="h-4 w-4 mr-1" />}
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
