'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ComparativoItem {
  nombre: string
  actual: number
  anterior?: number
  unidad?: 'money' | 'number'
}

interface ComparativoCardProps {
  titulo: string
  items: ComparativoItem[]
}

export function ComparativoCard({ titulo, items }: ComparativoCardProps) {
  const calcularCambio = (actual: number, anterior?: number) => {
    if (!anterior || anterior === 0) return 0
    return ((actual - anterior) / anterior) * 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const cambio = calcularCambio(item.actual, item.anterior)
            const valor = item.unidad === 'money' 
              ? formatCurrency(item.actual) 
              : item.actual.toLocaleString()

            return (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.nombre}</p>
                  <p className="text-2xl font-bold mt-1">{valor}</p>
                </div>
                {item.anterior !== undefined && (
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      cambio > 0 ? 'text-green-600' : cambio < 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {cambio > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : cambio < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                      {Math.abs(cambio).toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      vs período anterior
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}