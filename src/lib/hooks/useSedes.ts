'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { usePerfil } from '@/lib/hooks/usePerfil'

export interface Sede {
  id: string
  nombre: string
  direccion: string
  telefono: string | null
  email: string | null
  ciudad: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export function useSedes() {
  const { isAdmin, isGerente, isLoading: perfilLoading } = usePerfil()
  const canManageSedes = isAdmin || isGerente
  const queryClient = useQueryClient()

  // Obtener TODAS las sedes (activas e inactivas)
  const { data: sedes, isLoading: sedesLoading } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return data as Sede[]
    },
    enabled: true,
  })

  // Crear sede
  const createSede = useMutation({
    mutationFn: async (sede: Omit<Sede, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sedes')
        .insert([sede])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] })
    },
  })

  // Actualizar sede
  const updateSede = useMutation({
    mutationFn: async ({ id, ...sede }: Partial<Sede> & { id: string }) => {
      const { data, error } = await supabase
        .from('sedes')
        .update(sede)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] })
    },
  })

  // Eliminar sede
  const deleteSede = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sedes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] })
    },
  })

  return {
    sedes,
    isLoading: sedesLoading || perfilLoading,  // Incluye loading de perfil
    createSede,
    updateSede,
    deleteSede,
    canManageSedes,
  }
}