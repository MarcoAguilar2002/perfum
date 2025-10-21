'use client'
import { toast } from 'sonner'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useClientes, Cliente } from '@/lib/hooks/useClientes'
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

interface ClienteDialogProps {
	open: boolean
	onClose: () => void
	cliente?: Cliente | null
}

export function ClienteDialog({ open, onClose, cliente }: ClienteDialogProps) {
	const { createCliente, updateCliente } = useClientes()
	const { register, handleSubmit, reset, formState: { errors } } = useForm()

	useEffect(() => {
		if (cliente) {
			reset(cliente)
		} else {
			reset({
				nombre: '',
				apellido: '',
				email: '',
				telefono: '',
				dni: '',
				direccion: '',
				fecha_nacimiento: '',
			})
		}
	}, [cliente, reset])

	const onSubmit = async (data: any) => {
		try {
			// Limpiar campos vacíos
			const cleanData = Object.fromEntries(
				Object.entries(data).filter(([_, v]) => v !== '')
			) as Omit<Cliente, 'created_at' | 'id'>

			if (cliente) {
				await updateCliente.mutateAsync({ id: cliente.id, ...cleanData })
				toast.success('Cliente actualizado correctamente ✅')
			} else {
				await createCliente.mutateAsync(cleanData)
				toast.success('Cliente creado exitosamente 🎉')
			}

			onClose()
		} catch (error: any) {
			console.error(error)
			if (error.code === '23505') {
				toast.info('Ya existe un cliente con este DNI ⚠️')
			} else {
				toast.error('Error al guardar el cliente ❌')
			}
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
					</DialogTitle>
					<DialogDescription>
						{cliente
							? 'Modifica los datos del cliente'
							: 'Completa los datos del nuevo cliente'}
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
									placeholder="Juan"
								/>
								{errors.nombre && (
									<p className="text-sm text-red-500">Este campo es requerido</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="apellido">Apellido</Label>
								<Input
									id="apellido"
									{...register('apellido')}
									placeholder="Pérez"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="dni">DNI</Label>
								<Input
									id="dni"
									{...register('dni')}
									placeholder="12345678"
									maxLength={8}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
								<Input
									id="fecha_nacimiento"
									type="date"
									{...register('fecha_nacimiento')}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									{...register('email')}
									placeholder="cliente@email.com"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="telefono">Teléfono</Label>
								<Input
									id="telefono"
									{...register('telefono')}
									placeholder="987654321"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="direccion">Dirección</Label>
							<Textarea
								id="direccion"
								{...register('direccion')}
								placeholder="Calle, número, distrito..."
								rows={2}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button type="submit">
							{cliente ? 'Actualizar' : 'Crear'} Cliente
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
