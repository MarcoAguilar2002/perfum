'use client'

import { useState } from 'react'
import { useVentas } from '@/lib/hooks/useVentas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Eye, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function VentasPage() {
  const { ventas, isLoading, cancelarVenta } = useVentas()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVentas = ventas?.filter((v) =>
    v.clientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.clientes?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.id.includes(searchTerm)
  )

  const handleCancelar = async (id: string) => {
    if (confirm('¿Estás seguro de cancelar esta venta?')) {
      await cancelarVenta.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-500 mt-1">
            Gestiona todas tus ventas
          </p>
        </div>
        <Link href="/ventas/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar ventas por cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando ventas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVentas?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No hay ventas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVentas?.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-mono text-xs">
                        {venta.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{formatDate(venta.created_at)}</TableCell>
                      <TableCell>
                        {venta.clientes 
                          ? `${venta.clientes.nombre} ${venta.clientes.apellido}`
                          : 'Cliente general'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(venta.total)}
                      </TableCell>
                      <TableCell className="capitalize">{venta.metodo_pago}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            venta.estado === 'completada'
                              ? 'bg-green-100 text-green-700'
                              : venta.estado === 'cancelada'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {venta.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {venta.estado === 'completada' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelar(venta.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}