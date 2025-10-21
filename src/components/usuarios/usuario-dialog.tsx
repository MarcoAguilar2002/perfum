'use client'
import { toast } from 'sonner' // Importa en el componente/hook
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { supabase } from '@/lib/supabase/client'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface UserDialogProps {
	open: boolean
	onClose: () => void
	onUserCreated?: () => void // Nuevo prop
}

type FormData = {
	email: string
	password: string
	confirmPassword: string
	nombre: string
	apellido: string
	rol: 'admin' | 'gerente' | 'vendedor'
	sede_id: string | null
}

export function UserDialog({ open, onClose, onUserCreated }: UserDialogProps) {
	const { sedes } = useSedes()
	const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<FormData>({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			nombre: '',
			apellido: '',
			rol: 'vendedor',
			sede_id: null,
		},
	})
	const [creating, setCreating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const password = watch('password')
	const confirmPassword = watch('confirmPassword')

	useEffect(() => {
		if (!open) {
			reset() // Reset form al cerrar
			setError(null)
		}
	}, [open, reset])

	const onSubmit = async (data: FormData) => {
		if (data.password !== data.confirmPassword) {
			toast.error('Las contraseñas no coinciden ❌')
			return
		}

		setCreating(true)
		setError(null)

		try {
			// 1. Crear usuario en Auth
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
				options: {
					data: {
						nombre: data.nombre,
						apellido: data.apellido,
					},
				},
			})

			if (authError) throw authError
			if (!authData.user) throw new Error('No se pudo crear el usuario')

			// 2. Insertar perfil
			const { error: profileError } = await supabase
				.from('perfiles')
				.insert({
					id: authData.user.id,
					nombre: data.nombre,
					apellido: data.apellido,
					email: data.email,
					rol: data.rol,
					sede_id: data.sede_id || null,
				})

			if (profileError) throw profileError

			toast.success('Usuario creado exitosamente 🎉. Revisa el email para confirmar.')
			onClose()
			onUserCreated?.()
		} catch (err: any) {
			console.error(err)
			toast.error(err.message || 'Error al crear el usuario ❌')
			setError(err.message || 'Error al crear el usuario')
		} finally {
			setCreating(false)
		}
}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Nuevo Usuario</DialogTitle>
					<DialogDescription>Crea un nuevo usuario en el sistema</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="nombre">Nombre *</Label>
								<Input
									id="nombre"
									{...register('nombre', { required: true })}
									placeholder="Ej: Juan"
								/>
								{errors.nombre && <p className="text-sm text-red-500">Requerido</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="apellido">Apellido</Label>
								<Input
									id="apellido"
									{...register('apellido')}
									placeholder="Ej: Pérez"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email *</Label>
							<Input
								id="email"
								type="email"
								{...register('email', { required: true })}
								placeholder="usuario@ejemplo.com"
							/>
							{errors.email && <p className="text-sm text-red-500">Email requerido</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="password">Contraseña *</Label>
								<Input
									id="password"
									type="password"
									{...register('password', { required: true, minLength: 6 })}
									placeholder="Mínimo 6 caracteres"
								/>
								{errors.password && <p className="text-sm text-red-500">Contraseña requerida (mín. 6 chars)</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
								<Input
									id="confirmPassword"
									type="password"
									{...register('confirmPassword', { 
										required: true, 
										validate: (value) => value === password || 'Las contraseñas no coinciden'
									})}
									placeholder="Repite la contraseña"
								/>
								{errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="rol">Rol *</Label>
							<Select 
								value={watch('rol')} 
								onValueChange={(value) => setValue('rol', value as 'admin' | 'gerente' | 'vendedor')}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona rol" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Administrador</SelectItem>
									<SelectItem value="gerente">Gerente</SelectItem>
									<SelectItem value="vendedor">Vendedor</SelectItem>
								</SelectContent>
							</Select>
							{errors.rol && <p className="text-sm text-red-500">Rol requerido</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="sede_id">Sede</Label>
							<Select 
								value={watch('sede_id') || 'none'}
								onValueChange={(value) => setValue('sede_id', value === 'none' ? null : value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Sin sede" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Sin sede</SelectItem>
									{sedes?.map((sede) => (
										<SelectItem key={sede.id} value={sede.id}>
											{sede.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
								{error}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={creating}>
							Cancelar
						</Button>
						<Button type="submit" disabled={creating}>
							{creating ? 'Creando...' : 'Crear Usuario'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
