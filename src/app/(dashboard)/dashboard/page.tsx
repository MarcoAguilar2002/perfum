'use client'

import { useProductos } from '@/lib/hooks/useProductos'
import { useVentas } from '@/lib/hooks/useVentas'
import { useClientes } from '@/lib/hooks/useClientes'
import { useInventario } from '@/lib/hooks/useInventario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
	const { productos } = useProductos()
	const { ventas } = useVentas()
	const { clientes } = useClientes()
	const { inventario } = useInventario()

	// Calcular estadísticas
	const totalVentas = ventas?.reduce((sum, v) => sum + v.total, 0) || 0
	const ventasHoy = ventas?.filter(v => {
		const today = new Date().toDateString()
		return new Date(v.created_at).toDateString() === today
	}).length || 0

	const productosActivos = productos?.filter(p => p.activo).length || 0
	const totalClientes = clientes?.length || 0

	// Stock bajo
	const stockBajo = inventario?.filter(i => i.stock_actual <= i.stock_minimo) || []

	const stats = [
		{
			title: 'Total Ventas',
			value: formatCurrency(totalVentas),
			change: `${ventas?.length || 0} ventas registradas`,
			icon: DollarSign,
			color: 'text-green-600',
			bgColor: 'bg-green-100',
		},
		{
			title: 'Productos',
			value: productosActivos.toString(),
			change: 'Productos activos',
			icon: Package,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
		},
		{
			title: 'Ventas Hoy',
			value: ventasHoy.toString(),
			change: 'Ventas realizadas hoy',
			icon: ShoppingCart,
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
		},
		{
			title: 'Clientes',
			value: totalClientes.toString(),
			change: 'Clientes registrados',
			icon: Users,
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
		},
	]


	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
				<p className="text-slate-500 mt-1">
					Resumen general de tu negocio
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon
					return (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.title}
								</CardTitle>
								<div className={`p-2 rounded-lg ${stat.bgColor}`}>
									<Icon className={`h-4 w-4 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<p className="text-xs text-slate-500 mt-1">
									{stat.change}
								</p>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Ventas Recientes</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-slate-500">
							Próximamente: Gráfico de ventas
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Productos Más Vendidos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-slate-500">
							Próximamente: Top productos
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
