'use client'
import { toast } from 'sonner' // Importa en el componente/hook

import { useEffect, useState } from 'react'
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
import { supabase } from '@/lib/supabase/client'

interface ProductoDialogProps {
	open: boolean
	onClose: () => void
	producto?: Producto | null
}

type FormData = Partial<Producto> & { imagen?: FileList }

export function ProductoDialog({ open, onClose, producto }: ProductoDialogProps) {
	const { createProducto, updateProducto } = useProductos()
	const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm<FormData>()
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)

	useEffect(() => {
		if (producto) {
			reset(producto)
			setPreviewUrl(producto.imagen_url || null)
		} else {
			reset({
				nombre: '',
				descripcion: '',
				marca: '',
				precio_compra: 0,
				precio_venta: 0,
				codigo_barras: '',
				activo: true,
				imagen_url: null,
			})
			setPreviewUrl(null)
		}
	}, [producto, reset])

	// Preview al seleccionar archivo
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)
		}
	}

	// Limpieza de URL temporal
	useEffect(() => {
		return () => {
			if (previewUrl && previewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(previewUrl)
			}
		}
	}, [previewUrl])

	const onSubmit = async (data: FormData) => {
	setUploading(true)
	try {
		let imagenUrl: string | null = data.imagen_url || null

		// Si hay un nuevo archivo, súbelo
		const files = getValues('imagen')
		const file = files?.[0]
		if (file) {
			const fileExt = file.name.split('.').pop()
			const fileName = `${producto?.id || `new-${Date.now()}`}.${fileExt}`

			const { error: uploadError } = await supabase.storage
				.from('productos-images')
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: !!producto?.id,
				})

			if (uploadError) throw uploadError

			const { data: urlData } = supabase.storage
				.from('productos-images')
				.getPublicUrl(fileName)

			imagenUrl = urlData.publicUrl
		}

		// Data final sin el campo 'imagen'
		const finalData = { ...data, imagen_url: imagenUrl }
		delete (finalData as any).imagen

		if (producto) {
			await updateProducto.mutateAsync({ id: producto.id, ...finalData })
			toast.success('Producto actualizado correctamente ✅')
		} else {
			await createProducto.mutateAsync(finalData as any)
			toast.success('Producto creado exitosamente 🎉')
		}

		onClose()
	} catch (error: any) {
		console.error(error)
		toast.error('Error al guardar el producto ❌')
	} finally {
		setUploading(false)
	}
}
	// Para combinar onChange de RHF y preview
	const imagenRegister = register('imagen', { required: false })
	const { onChange: rhfOnChange, ...imagenRest } = imagenRegister

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
									step="1"
									{...register('precio_compra', { required: true, valueAsNumber: true })}
									placeholder="0.00"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="precio_venta">Precio Venta *</Label>
								<Input
									id="precio_venta"
									type="number"
									step="1"
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

						{/* Preview de imagen */}
						{(previewUrl || producto?.imagen_url) && (
							<div className="space-y-2">
								<Label>Imagen actual / Preview</Label>
								<img
									src={previewUrl || producto?.imagen_url || ''}
									alt="Producto"
									className="w-full h-48 object-cover rounded-md border"
								/>
								{producto?.imagen_url && !getValues('imagen')?.length && (
									<p className="text-sm text-gray-500">Imagen actual. Sube una nueva para reemplazarla.</p>
								)}
							</div>
						)}

						{/* Input de imagen */}
						<div className="space-y-2">
							<Label htmlFor="imagen">Imagen (opcional)</Label>
							<Input
								id="imagen"
								type="file"
								accept="image/*"
								{...imagenRest}
								onChange={(e) => {
									rhfOnChange(e)
									handleImageChange(e)
								}}
							/>
							{errors.imagen && (
								<p className="text-sm text-red-500">Este campo es requerido</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
							Cancelar
						</Button>
						<Button type="submit" disabled={uploading}>
							{uploading ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear')} Producto
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
