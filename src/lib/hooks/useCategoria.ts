'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { usePerfil } from '@/lib/hooks/usePerfil'

export interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
}

export function useCategorias() {
  const { isAdmin, isGerente, isLoading: perfilLoading } = usePerfil()
  const canManageCategories = isAdmin || isGerente
  const queryClient = useQueryClient()

  // Obtener todas las categorías
  const { data: categorias, isLoading: categoriasLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return data as Categoria[]
    },
    enabled: true,
  })

  // Crear categoría
  const createCategoria = useMutation({
    mutationFn: async (categoria: Omit<Categoria, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })

  // Actualizar categoría
  const updateCategoria = useMutation({
    mutationFn: async ({ id, ...categoria }: Partial<Categoria> & { id: string }) => {
      const { data, error } = await supabase
        .from('categorias')
        .update(categoria)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })

  // Eliminar categoría
  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })

  return {
    categorias,
    isLoading: categoriasLoading || perfilLoading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    canManageCategories,
  }
}