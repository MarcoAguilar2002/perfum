'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

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
  const { data: sedes, isLoading } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return data as Sede[]
    },
  })

  return {
    sedes,
    isLoading,
  }
}