'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { usePerfil } from '@/lib/hooks/usePerfil'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const rolesDisplay = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
}

export function Navbar() {
  const { user } = useAuth()
  const { perfil } = usePerfil()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Buscar productos, clientes..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
       
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{perfil?.nombre}</p>
            <p className="text-xs text-slate-500"> {perfil?.rol}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-sm font-medium text-slate-700">
              {user?.email?.[0].toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}