'use client'

import { useState } from 'react'
import { useInventario } from '@/lib/hooks/useInventario'
import { useSedes } from '@/lib/hooks/useSedes'
import { usePerfil } from '@/lib/hooks/usePerfil'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, AlertTriangle, Pencil, PackagePlus, PackageMinus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { InventarioDialog } from '@/components/invemtario/inventario-dialog'
import { AjustarStockDialog } from '@/components/invemtario/ajustar-stock-dialog' 

export default function InventarioPage() {
  const { inventario, isLoading } = useInventario()
  const { sedes } = useSedes()
  const [searchTerm, setSearchTerm] = useState('')
  const [sedeFilter, setSedeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [ajustarDialogOpen, setAjustarDialogOpen] = useState(false)
  const [editingInventario, setEditingInventario] = useState(null)
  const [selectedInventario, setSelectedInventario] = useState(null)

  const filteredInventario = inventario?.filter((item) => {
    const matchesSearch = 
      item.productos?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productos?.marca?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSede = sedeFilter === 'all' || item.sede_id === sedeFilter

    return matchesSearch && matchesSede
  })

  const handleEdit = (item: any) => {
    setEditingInventario(item)
    setDialogOpen(true)
  }

  const handleAjustar = (item: any) => {
    setSelectedInventario(item)
    setAjustarDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingInventario(null)
  }

  const handleCloseAjustarDialog = () => {
    setAjustarDialogOpen(false)
    setSelectedInventario(null)
  }

  const stockStatus = (item: any) => {
    if (item.stock_actual <= 0) return 'sin-stock'
    if (item.stock_actual <= item.stock_minimo) return 'bajo'
    if (item.stock_actual >= item.stock_maximo) return 'alto'
    return 'normal'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500 mt-1">
            Control de stock por sede
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar al Inventario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sedeFilter} onValueChange={setSedeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las sedes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {sedes?.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando inventario...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Mín/Máx</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventario?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No hay registros de inventario
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventario?.map((item) => {
                    const status = stockStatus(item)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.productos?.nombre}
                        </TableCell>
                        <TableCell>{item.productos?.marca || '-'}</TableCell>
                        <TableCell>{item.sedes?.nombre}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{item.stock_actual}</span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {item.stock_minimo} / {item.stock_maximo}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.productos?.precio_venta || 0)}
                        </TableCell>
                        <TableCell>
                          {status === 'sin-stock' && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                              <AlertTriangle className="h-3 w-3" />
                              Sin stock
                            </span>
                          )}
                          {status === 'bajo' && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="h-3 w-3" />
                              Stock bajo
                            </span>
                          )}
                          {status === 'normal' && (
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                              Normal
                            </span>
                          )}
                          {status === 'alto' && (
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                              Stock alto
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAjustar(item)}
                              title="Ajustar stock"
                            >
                              <PackagePlus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InventarioDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        inventario={editingInventario}
      />

      <AjustarStockDialog
        open={ajustarDialogOpen}
        onClose={handleCloseAjustarDialog}
        inventario={selectedInventario}
      />
    </div>
  )
}