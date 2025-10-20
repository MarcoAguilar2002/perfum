'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface Venta {
  id: string
  sede_id: string | null
  cliente_id: string | null
  user_id: string | null
  total: number
  metodo_pago: string
  estado: string
  notas: string | null
  created_at: string
}

export interface DetalleVenta {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface VentaCompleta extends Venta {
  detalle_ventas: (DetalleVenta & {
    productos: {
      nombre: string
      marca: string
    }
  })[]
  clientes?: {
    nombre: string
    apellido: string
  }
}

export function useVentas() {
  const queryClient = useQueryClient()

  // Obtener todas las ventas
  const { data: ventas, isLoading } = useQuery({
    queryKey: ['ventas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          clientes (nombre, apellido),
          detalle_ventas (
            *,
            productos (nombre, marca)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as VentaCompleta[]
    },
  })

  // Crear venta completa (con detalles)
  const createVenta = useMutation({
    mutationFn: async ({ 
      venta, 
      detalles 
    }: { 
      venta: Omit<Venta, 'id' | 'created_at'>
      detalles: Omit<DetalleVenta, 'id' | 'venta_id' | 'created_at'>[]
    }) => {
      // 1. Crear la venta
      const { data: ventaCreada, error: ventaError } = await supabase
        .from('ventas')
        .insert([venta])
        .select()
        .single()
      
      if (ventaError) throw ventaError

      // 2. Crear los detalles de la venta
      const detallesConVentaId = detalles.map(detalle => ({
        ...detalle,
        venta_id: ventaCreada.id
      }))

      const { error: detallesError } = await supabase
        .from('detalle_ventas')
        .insert(detallesConVentaId)
      
      if (detallesError) throw detallesError

      // 3. Actualizar inventario
      for (const detalle of detalles) {
        const { error: inventarioError } = await supabase.rpc(
          'actualizar_inventario',
          {
            p_producto_id: detalle.producto_id,
            p_sede_id: venta.sede_id,
            p_cantidad: -detalle.cantidad
          }
        )
        if (inventarioError) console.error('Error actualizando inventario:', inventarioError)
      }

      return ventaCreada
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
    },
  })

  // Cancelar venta
  const cancelarVenta = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ventas')
        .update({ estado: 'cancelada' })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
    },
  })

  return {
    ventas,
    isLoading,
    createVenta,
    cancelarVenta,
  }
}