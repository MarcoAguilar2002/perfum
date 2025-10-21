'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface Usuario {
	id: string
	nombre: string | null
	apellido: string | null
	rol: 'admin' | 'gerente' | 'vendedor'
	sede_id: string | null
	avatar_url: string | null
	created_at: string
	updated_at: string
	email: string | null  
	sedes?: {
		id: string
		nombre: string
	}
}

export function useUsers() {
	const queryClient = useQueryClient()

	const { data: usuarios, isLoading, error, refetch } = useQuery({
		queryKey: ['users'],
		queryFn: async () => {
			const { data, error: queryError } = await supabase
				.from('perfiles')
				.select(`
					*,
					sedes (id, nombre)
				`)
				.order('created_at', { ascending: false })

			if (queryError) {
				console.error('Error en query de perfiles:', queryError)
				throw queryError
			}

			// No más llamadas admin: email ya viene en data
			return data as Usuario[]
		},
		enabled: true, // Siempre habilitado
	})

	// Log de errores para debug en consola
	if (error) {
		console.error('Error general en useUsers:', error)
	}

	// Crear usuario (nueva mutación) - ADVERTENCIA: admin.createUser es inseguro en cliente (usa service role key)
	// Recomendación: Muévelo a un server action para seguridad
	const createUser = useMutation({
		mutationFn: async (userData: Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'sede_id' | 'email'> & { email: string; password: string; sede_id?: string | null }) => {
			// 1. Crear usuario en Auth con admin (auto-confirma)
			const { data: authData, error: authError } = await supabase.auth.admin.createUser({
				email: userData.email,
				password: userData.password,
				email_confirm: true, // Confirma automáticamente (sin email de verificación)
				user_metadata: { nombre: userData.nombre, apellido: userData.apellido },
			})

			if (authError) throw authError
			if (!authData.user) throw new Error('No se pudo crear el usuario en Auth')

			// 2. Insertar perfil
			const { error: profileError } = await supabase
				.from('perfiles')
				.insert({
					id: authData.user.id,
					nombre: userData.nombre,
					apellido: userData.apellido,
					email: userData.email,
					rol: userData.rol,
					sede_id: userData.sede_id || null,
				})

			if (profileError) throw profileError

			// Construir Usuario sin password y con updated_at
			return {
				id: authData.user.id,
				nombre: userData.nombre,
				apellido: userData.apellido,
				rol: userData.rol,
				sede_id: userData.sede_id || null,
				avatar_url: null, // Default
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				email: userData.email,
			} as Usuario
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] }) // Refetch usuarios
		},
	})

	return {
		usuarios,
		isLoading,
		error,
		refetch,
		createUser, // Nueva mutación para crear usuario
	}
}