'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Store, 
  Users, 
  BarChart3,
  LogOut 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useInventario } from '@/lib/hooks/useInventario'
import { usePerfil } from '@/lib/hooks/usePerfil'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'gerente', 'vendedor'],
  },
  {
    title: 'Productos',
    href: '/productos',
    icon: Package,
    roles: ['admin', 'gerente', 'vendedor'],
  },
  {
    title: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
    roles: ['admin', 'gerente', 'vendedor'],
  },
  {
    title: 'Inventario',
    href: '/inventario',
    icon: Store,
    showBadge: true,
    roles: ['admin', 'gerente'],
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
    roles: ['admin', 'gerente', 'vendedor'],
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { inventario } = useInventario()

  const stockBajo = inventario?.filter(i => i.stock_actual <= i.stock_minimo).length || 0

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-slate-900">Perfumería App</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
              {item.showBadge && stockBajo > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-medium text-white">
                  {stockBajo}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}