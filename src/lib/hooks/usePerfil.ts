'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export interface Perfil {
	id: string
	nombre: string | null
	apellido: string | null
	rol: 'admin' | 'gerente' | 'vendedor'
	sede_id: string | null
	avatar_url: string | null
	created_at: string
	updated_at: string
	sedes?: {
		id: string
		nombre: string
	}
}

export function usePerfil() {
	const { user } = useAuth()

	const { data: perfil, isLoading, refetch } = useQuery({
		queryKey: ['perfil', user?.id],
		queryFn: async () => {
			if (!user) return null

			const { data, error } = await supabase
				.from('perfiles')
				.select(`
					*,
					sedes (id, nombre)
				`)
				.eq('id', user.id)
				.single()

			if (error) throw error
			return data as Perfil
		},
		enabled: !!user,
	})

	// Helper para verificar permisos
	const isAdmin = perfil?.rol === 'admin'
	const isGerente = perfil?.rol === 'gerente'
	const isVendedor = perfil?.rol === 'vendedor'

	const canManageProducts = isAdmin
	const canManageInventory = isAdmin || isGerente
	const canManageSales = true // Todos pueden hacer ventas
	const canViewAllSedes = isAdmin || isGerente
	const canViewReports = isAdmin || isGerente
	const canManageUsers = isAdmin

	return {
		perfil,
		isLoading,
		refetch,
		// Permisos
		isAdmin,
		isGerente,
		isVendedor,
		canManageProducts,
		canManageInventory,
		canManageSales,
		canViewAllSedes,
		canViewReports,
		canManageUsers,
	}
}
