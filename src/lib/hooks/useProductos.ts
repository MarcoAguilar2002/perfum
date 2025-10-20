'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  marca: string | null
  categoria_id: string | null
  precio_compra: number
  precio_venta: number
  codigo_barras: string | null
  imagen_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export function useProductos() {
  const queryClient = useQueryClient()

  // Obtener todos los productos
  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Producto[]
    },
  })

  // Crear producto
  const createProducto = useMutation({
    mutationFn: async (producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  // Actualizar producto
  const updateProducto = useMutation({
    mutationFn: async ({ id, ...producto }: Partial<Producto> & { id: string }) => {
      const { data, error } = await supabase
        .from('productos')
        .update(producto)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  // Eliminar producto
  const deleteProducto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  return {
    productos,
    isLoading,
    createProducto,
    updateProducto,
    deleteProducto,
  }
}