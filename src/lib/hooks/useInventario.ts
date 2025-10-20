'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface Inventario {
  id: string
  producto_id: string
  sede_id: string
  stock_actual: number
  stock_minimo: number
  stock_maximo: number
  updated_at: string
  productos?: {
    nombre: string
    marca: string
    precio_venta: number
  }
  sedes?: {
    nombre: string
  }
}

export function useInventario() {
  const queryClient = useQueryClient()

  // Obtener todo el inventario
  const { data: inventario, isLoading } = useQuery({
    queryKey: ['inventario'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventario')
        .select(`
          *,
          productos (nombre, marca, precio_venta),
          sedes (nombre)
        `)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data as Inventario[]
    },
  })

  // Obtener inventario por sede
  const getInventarioBySede = async (sedeId: string) => {
    const { data, error } = await supabase
      .from('inventario')
      .select(`
        *,
        productos (nombre, marca, precio_venta),
        sedes (nombre)
      `)
      .eq('sede_id', sedeId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data as Inventario[]
  }

  // Crear registro de inventario
  const createInventario = useMutation({
    mutationFn: async (inventario: Omit<Inventario, 'id' | 'updated_at' | 'productos' | 'sedes'>) => {
      const { data, error } = await supabase
        .from('inventario')
        .insert([inventario])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
    },
  })

  // Actualizar inventario
  const updateInventario = useMutation({
    mutationFn: async ({ id, ...inventario }: Partial<Inventario> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventario')
        .update(inventario)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
    },
  })

  // Ajustar stock (aumentar o disminuir)
  const ajustarStock = useMutation({
    mutationFn: async ({ id, cantidad }: { id: string; cantidad: number }) => {
      const { data: current, error: fetchError } = await supabase
        .from('inventario')
        .select('stock_actual')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError

      const nuevoStock = current.stock_actual + cantidad

      const { data, error } = await supabase
        .from('inventario')
        .update({ stock_actual: nuevoStock })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
    },
  })

  // Eliminar registro de inventario
  const deleteInventario = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
    },
  })

  return {
    inventario,
    isLoading,
    getInventarioBySede,
    createInventario,
    updateInventario,
    ajustarStock,
    deleteInventario,
  }
}