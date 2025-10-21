'use client'
import { toast } from 'sonner' // Importa en el componente/hook

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
import { useSedes, Sede } from '@/lib/hooks/useSedes'

interface SedesDialogProps {
	open: boolean
	onClose: () => void
	sede?: Sede | null
}

type FormData = Partial<Sede>

export function SedesDialog({ open, onClose, sede }: SedesDialogProps) {
	const { createSede, updateSede } = useSedes()
	const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>()
	const [uploading, setUploading] = useState(false)

	useEffect(() => {
		if (sede) {
			reset(sede)
		} else {
			reset({
				nombre: '',
				direccion: '',
				telefono: '',
				email: '',
				ciudad: '',
				activo: true,
			})
		}
	}, [sede, reset])

	const onSubmit = async (data: FormData) => {
	setUploading(true)
	try {
		if (sede) {
			await updateSede.mutateAsync({ id: sede.id, ...data })
			toast.success('Sede actualizada correctamente ✅')
		} else {
			await createSede.mutateAsync(data as Omit<Sede, 'id' | 'created_at' | 'updated_at'>)
			toast.success('Sede creada exitosamente 🎉')
		}
		onClose()
	} catch (error: any) {
		console.error(error)
		toast.error('Error al guardar la sede ❌')
	} finally {
		setUploading(false)
	}
}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{sede ? 'Editar Sede' : 'Nueva Sede'}</DialogTitle>
					<DialogDescription>
						{sede ? 'Modifica los datos de la sede' : 'Completa los datos de la nueva sede'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="nombre">Nombre *</Label>
							<Input
								id="nombre"
								{...register('nombre', { required: true })}
								placeholder="Ej: Sede Centro"
							/>
							{errors.nombre && <p className="text-sm text-red-500">Requerido</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="direccion">Dirección *</Label>
							<Input
								id="direccion"
								{...register('direccion', { required: true })}
								placeholder="Ej: Calle Principal 123"
							/>
							{errors.direccion && <p className="text-sm text-red-500">Requerido</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="telefono">Teléfono</Label>
								<Input
									id="telefono"
									{...register('telefono')}
									placeholder="Ej: 9459687546"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									{...register('email')}
									placeholder="Ej: sede@perfumeria.com"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="ciudad">Ciudad</Label>
							<Input
								id="ciudad"
								{...register('ciudad')}
								placeholder="Ej: Trujillo"
							/>
						</div>

						<div className="flex items-center space-x-2">
							<Controller
								name="activo"
								control={control}
								render={({ field }) => (
									<Switch
										id="activo"
										checked={field.value || false}
										onCheckedChange={(checked) => field.onChange(checked)}
									/>
								)}
							/>
							<Label htmlFor="activo">Activo</Label>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
							Cancelar
						</Button>
						<Button type="submit" disabled={uploading}>
							{uploading ? 'Guardando...' : (sede ? 'Actualizar' : 'Crear')} Sede
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
