'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface ReporteVentas {
  fecha: string
  total_ventas: number
  cantidad_ventas: number
  ticket_promedio: number
}

export interface ReporteProducto {
  producto_id: string
  producto_nombre: string
  marca: string
  cantidad_vendida: number
  total_vendido: number
}

export interface ReporteSede {
  sede_id: string
  sede_nombre: string
  total_ventas: number
  cantidad_ventas: number
}

export function useReportes() {
  // Reporte general de ventas por fecha
  const getVentasPorFecha = async (fechaInicio: string, fechaFin: string) => {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // Productos más vendidos
  const getProductosMasVendidos = async (fechaInicio?: string, fechaFin?: string, sedeId?: string) => {
    let query = supabase
      .from('detalle_ventas')
      .select(`
        producto_id,
        cantidad,
        precio_unitario,
        subtotal,
        productos (nombre, marca),
        ventas!inner (created_at, sede_id)
      `)

    if (fechaInicio) {
      query = query.gte('ventas.created_at', fechaInicio)
    }
    if (fechaFin) {
      query = query.lte('ventas.created_at', fechaFin)
    }
    if (sedeId) {
      query = query.eq('ventas.sede_id', sedeId)
    }

    const { data, error } = await query

    if (error) throw error

    // Agrupar por producto
    const agrupado = data.reduce((acc: any, item: any) => {
      const key = item.producto_id
      if (!acc[key]) {
        acc[key] = {
          producto_id: item.producto_id,
          producto_nombre: item.productos.nombre,
          marca: item.productos.marca,
          cantidad_vendida: 0,
          total_vendido: 0,
        }
      }
      acc[key].cantidad_vendida += item.cantidad
      acc[key].total_vendido += item.subtotal
      return acc
    }, {})

    return Object.values(agrupado).sort((a: any, b: any) => b.total_vendido - a.total_vendido)
  }

  // Ventas por sede
  const getVentasPorSede = async (fechaInicio?: string, fechaFin?: string) => {
    let query = supabase
      .from('ventas')
      .select(`
        sede_id,
        total,
        sedes (nombre)
      `)

    if (fechaInicio) {
      query = query.gte('created_at', fechaInicio)
    }
    if (fechaFin) {
      query = query.lte('created_at', fechaFin)
    }

    const { data, error } = await query

    if (error) throw error

    // Agrupar por sede
    const agrupado = data.reduce((acc: any, item: any) => {
      const key = item.sede_id || 'sin-sede'
      if (!acc[key]) {
        acc[key] = {
          sede_id: item.sede_id,
          sede_nombre: item.sedes?.nombre || 'Sin sede',
          total_ventas: 0,
          cantidad_ventas: 0,
        }
      }
      acc[key].total_ventas += item.total
      acc[key].cantidad_ventas += 1
      return acc
    }, {})

    return Object.values(agrupado).sort((a: any, b: any) => b.total_ventas - a.total_ventas)
  }

  // Ventas por período (diarias, semanales, mensuales)
  const getVentasPorPeriodo = async (fechaInicio: string, fechaFin: string, tipo: 'dia' | 'semana' | 'mes') => {
    const { data, error } = await supabase
      .from('ventas')
      .select('created_at, total')
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Agrupar por período
    const agrupado: { [key: string]: { fecha: string; total: number; cantidad: number } } = {}

    data.forEach((venta) => {
      const fecha = new Date(venta.created_at)
      let key: string

      if (tipo === 'dia') {
        key = fecha.toISOString().split('T')[0]
      } else if (tipo === 'semana') {
        const primerDia = new Date(fecha)
        primerDia.setDate(fecha.getDate() - fecha.getDay())
        key = primerDia.toISOString().split('T')[0]
      } else {
        key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      }

      if (!agrupado[key]) {
        agrupado[key] = { fecha: key, total: 0, cantidad: 0 }
      }
      agrupado[key].total += venta.total
      agrupado[key].cantidad += 1
    })

    return Object.values(agrupado).sort((a, b) => a.fecha.localeCompare(b.fecha))
  }

  // Estadísticas generales
  const getEstadisticasGenerales = async (fechaInicio?: string, fechaFin?: string, sedeId?: string) => {
    let query = supabase
      .from('ventas')
      .select('total, created_at, sede_id')

    if (fechaInicio) {
      query = query.gte('created_at', fechaInicio)
    }
    if (fechaFin) {
      query = query.lte('created_at', fechaFin)
    }
    if (sedeId) {
      query = query.eq('sede_id', sedeId)
    }

    const { data, error } = await query

    if (error) throw error

    const totalVentas = data.reduce((sum, v) => sum + v.total, 0)
    const cantidadVentas = data.length
    const ticketPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0

    return {
      totalVentas,
      cantidadVentas,
      ticketPromedio,
    }
  }

  return {
    getVentasPorFecha,
    getProductosMasVendidos,
    getVentasPorSede,
    getVentasPorPeriodo,
    getEstadisticasGenerales,
  }
}