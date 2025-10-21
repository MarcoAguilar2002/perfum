'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { usePerfil } from '@/lib/hooks/usePerfil'

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
  const { perfil, isLoading: perfilLoading } = usePerfil()
  const queryClient = useQueryClient()

  // Obtener productos filtrados por sede si es vendedor, todos si admin/gerente
  const { 
    data: productos, 
    isLoading: productosLoading, 
    isFetching  // <- Agrega isFetching aquí para exponerlo
  } = useQuery({
    queryKey: ['productos', perfil?.sede_id, perfil?.rol],
    queryFn: async () => {
      // Primero, obtener todos los productos activos
      const { data: baseData, error: baseError } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
      
      if (baseError) {
        console.error('Error fetching base productos:', baseError)
        throw baseError
      }

      let filteredProductos = baseData as Producto[]

      // Si es vendedor, filtrar solo productos que existen en el inventario de su sede
      if (perfil?.rol === 'vendedor' && perfil?.sede_id) {
        const { data: inventario, error: invError } = await supabase
          .from('inventario')
          .select('producto_id')
          .eq('sede_id', perfil.sede_id)
        
        if (invError) {
          console.error('Error fetching inventario for sede:', invError)
          throw invError
        }

        const allowedProductIds = inventario?.map((item) => item.producto_id) || []
        filteredProductos = baseData.filter((p) => allowedProductIds.includes(p.id))
      }
      // Para admin y gerente: mantener todos los productos activos

      return filteredProductos
    },
    enabled: !perfilLoading && !!perfil,  // Espera a que cargue el perfil y exista
    staleTime: 5 * 60 * 1000,  // 5 minutos de "frescura" antes de refetch automático
    placeholderData: () => queryClient.getQueryData(['productos']),  // Mantiene datos viejos durante refetch (menos parpadeo)
    refetchOnWindowFocus: false,  // No refetch al enfocar ventana
  })

  // Crear producto (con optimistic update)
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
    onMutate: async (newProducto) => {
      await queryClient.cancelQueries({ queryKey: ['productos'] })
      const previousProductos = queryClient.getQueryData<Producto[]>(['productos'])
      // Optimistic: Agregar el nuevo producto (sin ID real aún)
      const optimisticProducto = { ...newProducto, id: 'temp-' + Date.now(), created_at: new Date().toISOString() }
      queryClient.setQueryData(['productos'], (old: Producto[] | undefined) => [...(old || []), optimisticProducto])
      return { previousProductos }
    },
    onError: (err, newProducto, context) => {
      queryClient.setQueryData(['productos'], context?.previousProductos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })  // Refetch en background
    },
  })

  // Actualizar producto (con optimistic update)
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
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['productos'] })
      const previousProductos = queryClient.getQueryData<Producto[]>(['productos'])
      queryClient.setQueryData(['productos'], (old: Producto[] | undefined) =>
        old?.map(p => p.id === id ? { ...p, ...updates } : p) || []
      )
      return { previousProductos }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['productos'], context?.previousProductos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  // Eliminar producto (con optimistic update)
  const deleteProducto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['productos'] })
      const previousProductos = queryClient.getQueryData<Producto[]>(['productos'])
      // Optimistic: Remover inmediatamente
      queryClient.setQueryData(['productos'], (old: Producto[] | undefined) =>
        old?.filter(p => p.id !== id) || []
      )
      return { previousProductos }
    },
    onError: (err, id, context) => {
      // Rollback si falla
      queryClient.setQueryData(['productos'], context?.previousProductos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })  // Refetch en background
    },
  })

  return {
    productos,
    isLoading: productosLoading || perfilLoading,
    isFetching,  // <- Exposición de isFetching para el componente
    createProducto,
    updateProducto,
    deleteProducto,
  }
}