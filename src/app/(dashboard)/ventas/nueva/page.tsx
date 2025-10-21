'use client'
import { toast } from 'sonner' // Importa en el componente/hook

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProductos } from '@/lib/hooks/useProductos'
import { useVentas } from '@/lib/hooks/useVentas'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePerfil } from '@/lib/hooks/usePerfil' // <- Agrega esto
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from '@/components/ui/select'
import { Search, Trash2, ShoppingCart, AlertCircle } from 'lucide-react' // <- Agrega AlertCircle para errores
import { formatCurrency } from '@/lib/utils'

interface ItemCarrito {
	producto_id: string
	nombre: string
	precio: number
	cantidad: number
	subtotal: number
}

export default function NuevaVentaPage() {
	const router = useRouter()
	const { user } = useAuth()
	const { perfil, isLoading: perfilLoading } = usePerfil() // <- Usa usePerfil
	const { productos } = useProductos()
	const { createVenta } = useVentas()

	const [carrito, setCarrito] = useState<ItemCarrito[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [metodoPago, setMetodoPago] = useState('efectivo')
	const [loading, setLoading] = useState(false)

	// Verifica si el usuario tiene sede asignada
	const hasSede = !!perfil?.sede_id

	const productosFiltrados = productos?.filter((p) =>
		p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
		p.marca?.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const agregarAlCarrito = (producto: any) => {
		const itemExistente = carrito.find(item => item.producto_id === producto.id)

		if (itemExistente) {
			setCarrito(carrito.map(item =>
				item.producto_id === producto.id
					? { 
						...item, 
						cantidad: item.cantidad + 1,
						subtotal: (item.cantidad + 1) * item.precio
						}
					: item
			))
		} else {
			setCarrito([
				...carrito,
				{
					producto_id: producto.id,
					nombre: producto.nombre,
					precio: producto.precio_venta,
					cantidad: 1,
					subtotal: producto.precio_venta
				}
			])
		}
		setSearchTerm('')
	}

	const actualizarCantidad = (producto_id: string, cantidad: number) => {
		if (cantidad <= 0) {
			eliminarDelCarrito(producto_id)
			return
		}

		setCarrito(carrito.map(item =>
			item.producto_id === producto_id
				? { ...item, cantidad, subtotal: cantidad * item.precio }
				: item
		))
	}

	const eliminarDelCarrito = (producto_id: string) => {
		setCarrito(carrito.filter(item => item.producto_id !== producto_id))
	}

	const calcularTotal = () => {
		return carrito.reduce((sum, item) => sum + item.subtotal, 0)
	}

	const procesarVenta = async () => {
	if (carrito.length === 0) {
		toast.error('El carrito está vacío 🛒')
		return
	}

	if (!hasSede) {
		toast.error('No tienes una sede asignada. Contacta al administrador ⚠️')
		return
	}

	setLoading(true)
	try {
		const venta = {
			sede_id: perfil.sede_id,
			cliente_id: null,
			user_id: user?.id || null,
			total: calcularTotal(),
			metodo_pago: metodoPago,
			estado: 'completada',
			notas: null,
		}

		const detalles = carrito.map(item => ({
			producto_id: item.producto_id,
			cantidad: item.cantidad,
			precio_unitario: item.precio,
			subtotal: item.subtotal,
		}))

		await createVenta.mutateAsync({ venta, detalles })

		toast.success('Venta registrada exitosamente 🎉')
		router.push('/ventas')
	} catch (error: any) {
		console.error(error)
		if (error.code === '42501') {
			toast.error('Error de permisos: Verifica tu sede asignada o contacta al admin ⚠️')
		} else {
			toast.error(`Error al procesar la venta: ${error.message || 'Desconocido'}`)
		}
	} finally {
		setLoading(false)
	}
}
	if (perfilLoading) {
		return <div>Cargando perfil...</div> // Opcional: loading spinner
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Nueva Venta</h1>
				<p className="text-slate-500 mt-1">
					Punto de venta - Agrega productos al carrito
					{perfil?.rol === 'vendedor' && (
						<span className="ml-2 inline-flex items-center gap-1 text-sm">
							<AlertCircle className="h-4 w-4 text-yellow-500" />
							Sede: {perfil.sede_id ? 'Asignada' : 'No asignada'}
						</span>
					)}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Panel de búsqueda de productos */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Buscar Productos</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<Input
								placeholder="Buscar por nombre o marca..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>

						{searchTerm && (
							<div className="max-h-96 overflow-y-auto space-y-2">
								{productosFiltrados?.map((producto) => (
									<div
										key={producto.id}
										className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
										onClick={() => agregarAlCarrito(producto)}
									>
										<div>
											<p className="font-medium">{producto.nombre}</p>
											<p className="text-sm text-slate-500">{producto.marca}</p>
										</div>
										<div className="text-right">
											<p className="font-semibold">{formatCurrency(producto.precio_venta)}</p>
										</div>
									</div>
								))}
								{productosFiltrados?.length === 0 && (
									<p className="text-center text-slate-500 py-4">
										No se encontraron productos
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Carrito */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingCart className="h-5 w-5" />
							Carrito ({carrito.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{carrito.length === 0 ? (
							<p className="text-center text-slate-500 py-8">
								El carrito está vacío
							</p>
						) : (
							<>
								<div className="space-y-3 max-h-64 overflow-y-auto">
									{carrito.map((item) => (
										<div key={item.producto_id} className="border rounded-lg p-3 space-y-2">
											<div className="flex justify-between items-start">
												<p className="font-medium text-sm">{item.nombre}</p>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() => eliminarDelCarrito(item.producto_id)}
												>
													<Trash2 className="h-3 w-3 text-red-500" />
												</Button>
											</div>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
													>
														-
													</Button>
													<span className="w-8 text-center">{item.cantidad}</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
													>
														+
													</Button>
												</div>
												<p className="font-semibold">{formatCurrency(item.subtotal)}</p>
											</div>
										</div>
									))}
								</div>

								<div className="border-t pt-4 space-y-3">
									<div className="space-y-2">
										<Label>Método de Pago</Label>
										<Select value={metodoPago} onValueChange={setMetodoPago}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="efectivo">Efectivo</SelectItem>
												<SelectItem value="tarjeta">Tarjeta</SelectItem>
												<SelectItem value="transferencia">Transferencia</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex justify-between items-center text-lg font-bold">
										<span>Total:</span>
										<span>{formatCurrency(calcularTotal())}</span>
									</div>

									<Button 
										className="w-full" 
										size="lg"
										onClick={procesarVenta}
										disabled={loading || !hasSede} // <- Deshabilita si no hay sede
									>
										{loading ? 'Procesando...' : 'Procesar Venta'}
									</Button>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
