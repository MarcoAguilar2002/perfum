'use client'
import { toast } from 'sonner'  // Importa en el componente/hook

import { useState, useEffect } from 'react'
import { useReportes } from '@/lib/hooks/useReportes'
import { useSedes } from '@/lib/hooks/useSedes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { BarChart3, TrendingUp, Package, Store, Calendar, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { SimpleBarChart } from '@/components/reportes/simple-bar-chart'

export default function ReportesPage() {
	const reportes = useReportes()
	const { sedes } = useSedes()

	// Filtros
	const [fechaInicio, setFechaInicio] = useState('')
	const [fechaFin, setFechaFin] = useState('')
	const [sedeSeleccionada, setSedeSeleccionada] = useState('all')
	const [periodoGrafico, setPeriodoGrafico] = useState<'dia' | 'semana' | 'mes'>('dia')

	// Datos
	const [estadisticas, setEstadisticas] = useState<any>(null)
	const [productosMasVendidos, setProductosMasVendidos] = useState<any[]>([])
	const [ventasPorSede, setVentasPorSede] = useState<any[]>([])
	const [ventasPorPeriodo, setVentasPorPeriodo] = useState<any[]>([])
	const [loading, setLoading] = useState(false)

	// Configurar fechas por defecto (último mes)
	useEffect(() => {
		const hoy = new Date()
		const hace30Dias = new Date(hoy)
		hace30Dias.setDate(hoy.getDate() - 30)

		setFechaInicio(hace30Dias.toISOString().split('T')[0])
		setFechaFin(hoy.toISOString().split('T')[0])
	}, [])

	const cargarReportes = async () => {
		if (!fechaInicio || !fechaFin) return

		const fechaInicioFull = `${fechaInicio}T00:00:00Z`
		const fechaFinFull = `${fechaFin}T23:59:59.999Z`  // Fin del día para incluir ventas de hoy

		setLoading(true)
		try {
			const sedeId = sedeSeleccionada === 'all' ? undefined : sedeSeleccionada

			const [stats, productos, sedes, periodo] = await Promise.all([
				reportes.getEstadisticasGenerales(fechaInicioFull, fechaFinFull, sedeId),
				reportes.getProductosMasVendidos(fechaInicioFull, fechaFinFull, sedeId),
				reportes.getVentasPorSede(fechaInicioFull, fechaFinFull),
				reportes.getVentasPorPeriodo(fechaInicioFull, fechaFinFull, periodoGrafico),
			])


			setEstadisticas(stats)
			setProductosMasVendidos(productos || [])
			setVentasPorSede(sedes || [])
			setVentasPorPeriodo(periodo || [])
		} catch (error) {
			toast.error('Error cargando reportes:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (fechaInicio && fechaFin) {
			cargarReportes()
		}
	}, [fechaInicio, fechaFin, sedeSeleccionada, periodoGrafico])

	const exportarCSV = () => {
		if (!estadisticas) return

		// Crear CSV con los datos actuales
		let csv = 'Reporte de Ventas\n\n'
		csv += `Período: ${fechaInicio} a ${fechaFin}\n`
		csv += `Sede: ${sedeSeleccionada === 'all' ? 'Todas' : sedes?.find(s => s.id === sedeSeleccionada)?.nombre}\n\n`

		csv += 'ESTADÍSTICAS GENERALES\n'
		csv += `Total Ventas,${estadisticas.totalVentas}\n`
		csv += `Cantidad Ventas,${estadisticas.cantidadVentas}\n`
		csv += `Ticket Promedio,${estadisticas.ticketPromedio}\n\n`

		csv += 'PRODUCTOS MÁS VENDIDOS\n'
		csv += 'Producto,Marca,Cantidad,Total\n'
		productosMasVendidos.forEach((p: any) => {
			csv += `"${p.producto_nombre}","${p.marca || ''}",${p.cantidad_vendida},${p.total_vendido}\n`
		})

		csv += '\nVENTAS POR SEDE\n'
		csv += 'Sede,Cantidad,Total\n'
		ventasPorSede.forEach((s: any) => {
			csv += `"${s.sede_nombre}",${s.cantidad_ventas},${s.total_ventas}\n`
		})

		// Descargar CSV
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `reporte-ventas-${fechaInicio}-${fechaFin}.csv`
		link.click()
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
					<p className="text-slate-500 mt-1">
						Análisis y estadísticas de ventas
					</p>
				</div>
				<Button onClick={exportarCSV} variant="outline">
					<Download className="mr-2 h-4 w-4" />
					Exportar
				</Button>
			</div>

			{/* Filtros */}
			<Card>
				<CardHeader>
					<CardTitle>Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<Label htmlFor="fecha-inicio">Fecha Inicio</Label>
							<Input
								id="fecha-inicio"
								type="date"
								value={fechaInicio}
								onChange={(e) => setFechaInicio(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fecha-fin">Fecha Fin</Label>
							<Input
								id="fecha-fin"
								type="date"
								value={fechaFin}
								onChange={(e) => setFechaFin(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="sede">Sede</Label>
							<Select value={sedeSeleccionada} onValueChange={setSedeSeleccionada}>
								<SelectTrigger>
									<SelectValue placeholder="Todas las sedes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todas las sedes</SelectItem>
									{sedes?.map((sede) => (
										<SelectItem key={sede.id} value={sede.id}>
											{sede.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="periodo">Período Gráfico</Label>
							<Select value={periodoGrafico} onValueChange={(v: any) => setPeriodoGrafico(v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="dia">Diario</SelectItem>
									<SelectItem value="semana">Semanal</SelectItem>
									<SelectItem value="mes">Mensual</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{loading ? (
				<div className="text-center py-12">
					<p className="text-slate-500">Cargando reportes...</p>
				</div>
			) : (
				<>
					{/* Estadísticas Generales */}
					{estadisticas && (
						<div className="grid gap-4 md:grid-cols-3">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
									<TrendingUp className="h-4 w-4 text-green-600" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{formatCurrency(estadisticas.totalVentas)}
									</div>
									<p className="text-xs text-slate-500 mt-1">
										{estadisticas.cantidadVentas} ventas realizadas
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
									<BarChart3 className="h-4 w-4 text-blue-600" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{formatCurrency(estadisticas.ticketPromedio)}
									</div>
									<p className="text-xs text-slate-500 mt-1">
										Promedio por venta
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Cantidad Ventas</CardTitle>
									<Calendar className="h-4 w-4 text-purple-600" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{estadisticas.cantidadVentas}
									</div>
									<p className="text-xs text-slate-500 mt-1">
										En el período seleccionado
									</p>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Tabs con diferentes vistas */}
					<Tabs defaultValue="productos" className="space-y-4">
						<TabsList>
							<TabsTrigger value="productos">
								<Package className="h-4 w-4 mr-2" />
								Por Producto
							</TabsTrigger>
							<TabsTrigger value="sedes">
								<Store className="h-4 w-4 mr-2" />
								Por Sede
							</TabsTrigger>
							<TabsTrigger value="periodo">
								<Calendar className="h-4 w-4 mr-2" />
								Por Período
							</TabsTrigger>
						</TabsList>

						{/* Productos más vendidos */}
						<TabsContent value="productos">
							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Top 10 Productos</CardTitle>
									</CardHeader>
									<CardContent>
										<SimpleBarChart
											data={productosMasVendidos.slice(0, 10).map(p => ({
												label: p.producto_nombre,
												value: p.total_vendido,
												color: 'bg-blue-500'
											}))}
										/>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Detalle de Productos</CardTitle>
									</CardHeader>
									<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>#</TableHead>
												<TableHead>Producto</TableHead>
												<TableHead>Marca</TableHead>
												<TableHead>Cantidad Vendida</TableHead>
												<TableHead>Total Vendido</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{productosMasVendidos.length === 0 ? (
												<TableRow>
													<TableCell colSpan={5} className="text-center py-8 text-slate-500">
														No hay datos para este período
													</TableCell>
												</TableRow>
											) : (
												productosMasVendidos.map((producto: any, index) => (
													<TableRow key={producto.producto_id}>
														<TableCell className="font-medium">{index + 1}</TableCell>
														<TableCell>{producto.producto_nombre}</TableCell>
														<TableCell>{producto.marca || '-'}</TableCell>
														<TableCell>{producto.cantidad_vendida}</TableCell>
														<TableCell className="font-semibold">
															{formatCurrency(producto.total_vendido)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
								</div>

						</TabsContent>

						{/* Ventas por sede */}
						<TabsContent value="sedes">
							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Ventas por Sede</CardTitle>
									</CardHeader>
									<CardContent>
										<SimpleBarChart
											data={ventasPorSede.map(s => ({
												label: s.sede_nombre,
												value: s.total_ventas,
												color: 'bg-green-500'
											}))}
										/>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Detalle por Sede</CardTitle>
									</CardHeader>
									<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Sede</TableHead>
												<TableHead>Cantidad Ventas</TableHead>
												<TableHead>Total Vendido</TableHead>
												<TableHead>Ticket Promedio</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{ventasPorSede.length === 0 ? (
												<TableRow>
													<TableCell colSpan={4} className="text-center py-8 text-slate-500">
														No hay datos para este período
													</TableCell>
												</TableRow>
											) : (
												ventasPorSede.map((sede: any) => (
													<TableRow key={sede.sede_id}>
														<TableCell className="font-medium">{sede.sede_nombre}</TableCell>
														<TableCell>{sede.cantidad_ventas}</TableCell>
														<TableCell className="font-semibold">
															{formatCurrency(sede.total_ventas)}
														</TableCell>
														<TableCell>
															{formatCurrency(sede.total_ventas / sede.cantidad_ventas)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
							</div>
						</TabsContent>

						{/* Ventas por período */}
						<TabsContent value="periodo">
							<Card>
								<CardHeader>
									<CardTitle>Ventas por {periodoGrafico === 'dia' ? 'Día' : periodoGrafico === 'semana' ? 'Semana' : 'Mes'}</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Fecha</TableHead>
												<TableHead>Cantidad Ventas</TableHead>
												<TableHead>Total</TableHead>
												<TableHead>Promedio</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{ventasPorPeriodo.length === 0 ? (
												<TableRow>
													<TableCell colSpan={4} className="text-center py-8 text-slate-500">
														No hay datos para este período
													</TableCell>
												</TableRow>
											) : (
												ventasPorPeriodo.map((periodo: any) => (
													<TableRow key={periodo.fecha}>
														<TableCell className="font-medium">{periodo.fecha}</TableCell>
														<TableCell>{periodo.cantidad}</TableCell>
														<TableCell className="font-semibold">
															{formatCurrency(periodo.total)}
														</TableCell>
														<TableCell>
															{formatCurrency(periodo.total / periodo.cantidad)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	)
}