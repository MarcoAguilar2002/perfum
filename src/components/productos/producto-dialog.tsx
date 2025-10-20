'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useProductos, Producto } from '@/lib/hooks/useProductos'
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
import { Textarea } from '@/components/ui/textarea'

interface ProductoDialogProps {
  open: boolean
  onClose: () => void
  producto?: Producto | null
}

export function ProductoDialog({ open, onClose, producto }: ProductoDialogProps) {
  const { createProducto, updateProducto } = useProductos()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (producto) {
      reset(producto)
    } else {
      reset({
        nombre: '',
        descripcion: '',
        marca: '',
        precio_compra: 0,
        precio_venta: 0,
        codigo_barras: '',
        activo: true,
      })
    }
  }, [producto, reset])

  const onSubmit = async (data: any) => {
    try {
      if (producto) {
        await updateProducto.mutateAsync({ id: producto.id, ...data })
      } else {
        await createProducto.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar producto:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {producto
              ? 'Modifica los datos del producto'
              : 'Completa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  {...register('nombre', { required: true })}
                  placeholder="Ej: Perfume Dior"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">Este campo es requerido</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  {...register('marca')}
                  placeholder="Ej: Dior"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Describe el producto..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_compra">Precio Compra *</Label>
                <Input
                  id="precio_compra"
                  type="number"
                  step="0.01"
                  {...register('precio_compra', { required: true, valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_venta">Precio Venta *</Label>
                <Input
                  id="precio_venta"
                  type="number"
                  step="0.01"
                  {...register('precio_venta', { required: true, valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_barras">Código Barras</Label>
                <Input
                  id="codigo_barras"
                  {...register('codigo_barras')}
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {producto ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}