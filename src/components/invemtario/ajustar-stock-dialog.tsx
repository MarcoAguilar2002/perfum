'use client'

import { useState, useEffect } from 'react'
import { useInventario } from '@/lib/hooks/useInventario'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PackagePlus, PackageMinus } from 'lucide-react'

interface AjustarStockDialogProps {
  open: boolean
  onClose: () => void
  inventario: any
}

export function AjustarStockDialog({ open, onClose, inventario }: AjustarStockDialogProps) {
  const { ajustarStock } = useInventario()
  const [cantidad, setCantidad] = useState(1)
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setCantidad(1)
      setTipo('entrada')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventario) return

    setLoading(true)
    try {
      const cantidadAjustada = tipo === 'entrada' ? cantidad : -cantidad
      await ajustarStock.mutateAsync({
        id: inventario.id,
        cantidad: cantidadAjustada,
      })
      onClose()
    } catch (error) {
      console.error('Error al ajustar stock:', error)
      alert('Error al ajustar el stock')
    } finally {
      setLoading(false)
    }
  }

  if (!inventario) return null

  const nuevoStock = tipo === 'entrada' 
    ? inventario.stock_actual + cantidad 
    : inventario.stock_actual - cantidad

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            {inventario.productos?.nombre} - {inventario.sedes?.nombre}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">Stock actual</p>
              <p className="text-2xl font-bold">{inventario.stock_actual}</p>
            </div>

            <Tabs value={tipo} onValueChange={(v) => setTipo(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrada" className="gap-2">
                  <PackagePlus className="h-4 w-4" />
                  Entrada
                </TabsTrigger>
                <TabsTrigger value="salida" className="gap-2">
                  <PackageMinus className="h-4 w-4" />
                  Salida
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad a {tipo === 'entrada' ? 'agregar' : 'retirar'}
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">Nuevo stock</p>
              <p className={`text-2xl font-bold ${nuevoStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {nuevoStock}
              </p>
              {nuevoStock < 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ El stock no puede ser negativo
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || nuevoStock < 0}
            >
              {loading ? 'Ajustando...' : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}