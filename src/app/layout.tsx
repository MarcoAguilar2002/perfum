import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from 'sonner' // Importa Sonner
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Perfumería App - Gestión de Tiendas',
	description: 'Sistema de gestión para perfumerías con múltiples sedes',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="es">
			<body className={inter.className}>
				<QueryProvider>
					{children}
					<Toaster
					position="top-right" // Posición (top-right, bottom-right, etc.)
					richColors // Colores más vibrantes (opcional)
					closeButton // Botón de cerrar visible (opcional)
					duration={4000} // Duración en ms (opcional)
				/>
				</QueryProvider>
			</body>
		</html>
	)
}
