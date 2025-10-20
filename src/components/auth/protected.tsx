'use client'

import { usePerfil } from '@/lib/hooks/usePerfil'
import { ReactNode } from 'react'

interface ProtectedProps {
	children: ReactNode
	requiredRole?: 'admin' | 'gerente' | 'vendedor'
	requiredRoles?: ('admin' | 'gerente' | 'vendedor')[]
	fallback?: ReactNode
}

export function Protected({ 
	children, 
	requiredRole, 
	requiredRoles,
	fallback 
}: ProtectedProps) {
	const { perfil, isLoading } = usePerfil()

	if (isLoading) {
		return <div>Cargando...</div>
	}

	if (!perfil) {
		return fallback || <div>No tienes permisos para ver este contenido</div>
	}

	// Verificar un solo rol
	if (requiredRole && perfil.rol !== requiredRole) {
		return fallback || <div>No tienes permisos para ver este contenido</div>
	}

	// Verificar múltiples roles
	if (requiredRoles && !requiredRoles.includes(perfil.rol)) {
		return fallback || <div>No tienes permisos para ver este contenido</div>
	}

	return <>{children}</>
}
