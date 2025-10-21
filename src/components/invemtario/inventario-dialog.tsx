'use client'
import { toast } from 'sonner'  // Importa en el componente/hook
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useInventario } from '@/lib/hooks/useInventario'
import { useProductos } from '@/lib/hooks/useProductos'
import { useSedes } from '@/lib/hooks/useSedes'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InventarioDialogProps {
  open: boolean
  onClose: () => void
  inventario?: any
}

export function InventarioDialog({ open, onClose, inventario }: InventarioDialogProps) {
  const { createInventario, updateInventario } = useInventario()
  const { productos } = useProductos()
  const { sedes } = useSedes()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()

  const productoId = watch('producto_id')
  const sedeId = watch('sede_id')

  useEffect(() => {
    if (inventario) {
      reset({
        producto_id: inventario.producto_id,
        sede_id: inventario.sede_id,
        stock_actual: inventario.stock_actual,
        stock_minimo: inventario.stock_minimo,
        stock_maximo: inventario.stock_maximo,
      })
    } else {
      reset({
        producto_id: '',
        sede_id: '',
        stock_actual: 0,
        stock_minimo: 10,
        stock_maximo: 100,
      })
    }
  }, [inventario, reset])

  const onSubmit = async (data: any) => {
    try {
      if (inventario) {
        await updateInventario.mutateAsync({ id: inventario.id, ...data })
        toast.success('Inventario actualizado exitosamente')
      } else {
        await createInventario.mutateAsync(data)
        toast.success('Inventario actualizado exitosamente')
      }
      onClose()
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Ya existe un registro de inventario para este producto en esta sede')
      } else {
        toast.error('Error al guardar inventario:', error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {inventario ? 'Editar Inventario' : 'Agregar al Inventario'}
          </DialogTitle>
          <DialogDescription>
            {inventario
              ? 'Modifica los datos del inventario'
              : 'Registra un nuevo producto en el inventario de una sede'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="producto_id">Producto *</Label>
              <Select
                value={productoId}
                onValueChange={(value) => setValue('producto_id', value)}
                disabled={!!inventario}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos?.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} - {producto.marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.producto_id && (
                <p className="text-sm text-red-500">Este campo es requerido</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sede_id">Sede *</Label>
              <Select
                value={sedeId}
                onValueChange={(value) => setValue('sede_id', value)}
                disabled={!!inventario}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes?.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sede_id && (
                <p className="text-sm text-red-500">Este campo es requerido</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_actual">Stock Actual *</Label>
                <Input
                  id="stock_actual"
                  type="number"
                  {...register('stock_actual', { required: true, valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  {...register('stock_minimo', { valueAsNumber: true })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_maximo">Stock Máximo</Label>
                <Input
                  id="stock_maximo"
                  type="number"
                  {...register('stock_maximo', { valueAsNumber: true })}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {inventario ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}