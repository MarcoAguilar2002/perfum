'use client'

import { formatCurrency } from '@/lib/utils'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  data: DataPoint[]
  height?: number
}

export function SimpleBarChart({ data, height = 300 }: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No hay datos para mostrar
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100
        const color = item.color || 'bg-blue-500'
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-slate-600">{formatCurrency(item.value)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}