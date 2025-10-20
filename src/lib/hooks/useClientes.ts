'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface Cliente {
  id: string
  nombre: string
  apellido: string | null
  email: string | null
  telefono: string | null
  dni: string | null
  direccion: string | null
  fecha_nacimiento: string | null
  created_at: string
}

export function useClientes() {
  const queryClient = useQueryClient()

  // Obtener todos los clientes
  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Cliente[]
    },
  })

  // Obtener un cliente por ID
  const getClienteById = async (id: string) => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Cliente
  }

  // Crear cliente
  const createCliente = useMutation({
    mutationFn: async (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })

  // Actualizar cliente
  const updateCliente = useMutation({
    mutationFn: async ({ id, ...cliente }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })

  // Eliminar cliente
  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })

  return {
    clientes,
    isLoading,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
  }
}