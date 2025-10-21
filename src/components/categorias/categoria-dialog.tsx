'use client'
import { toast } from 'sonner'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { useCategorias, Categoria } from '@/lib/hooks/useCategoria'

interface CategoriaDialogProps {
  open: boolean
  onClose: () => void
  categoria?: Categoria | null
}

type FormData = Partial<Categoria>

export function CategoriaDialog({ open, onClose, categoria }: CategoriaDialogProps) {
  const { createCategoria, updateCategoria } = useCategorias()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (categoria) {
      reset(categoria)
    } else {
      reset({
        nombre: '',
        descripcion: '',
      })
    }
  }, [categoria, reset])

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    try {
      if (categoria) {
        await updateCategoria.mutateAsync({ id: categoria.id, ...data })
        toast.success('Categoría actualizada correctamente ✅')
      } else {
        await createCategoria.mutateAsync(data as Omit<Categoria, 'id' | 'created_at'>)
        toast.success('Categoría creada exitosamente 🎉')
      }
      onClose()
    } catch (error) {
      toast.error('Error al guardar la categoría ❌')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{categoria ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          <DialogDescription>
            {categoria ? 'Modifica los datos de la categoría' : 'Completa los datos de la nueva categoría'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                {...register('nombre', { required: true })}
                placeholder="Ej: Perfumes"
              />
              {errors.nombre && <p className="text-sm text-red-500">Requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Describe la categoría..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Guardando...' : (categoria ? 'Actualizar' : 'Crear')} Categoría
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
