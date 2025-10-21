'use client'
import { toast } from 'sonner'  // Importa en el componente/hook

import { usePerfil } from '@/lib/hooks/usePerfil'
import { useSedes } from '@/lib/hooks/useSedes'
import { useUsers } from '@/lib/hooks/useUsers'
import type { Usuario } from '@/lib/hooks/useUsers'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shield, UserCog } from 'lucide-react'
import { Protected } from '@/components/auth/protected'
import { AddUserButton } from '@/components/usuarios/buton-user'

export default function UsuariosPage() {
  const { isAdmin } = usePerfil()
  const { sedes } = useSedes()
  const { usuarios, isLoading, refetch } = useUsers()

  const actualizarRol = async (userId: string, nuevoRol: 'admin' | 'gerente' | 'vendedor') => {
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol })
      .eq('id', userId)

    if (error) {
      toast.error('Error actualizando rol:', error)
      alert('Error al actualizar el rol')
    } else {
      refetch()
    }
  }

  const actualizarSede = async (userId: string, sedeId: string | null) => {
    const { error } = await supabase
      .from('perfiles')
      .update({ sede_id: sedeId })
      .eq('id', userId)

    if (error) {
      toast.error('Error actualizando sede:', error)
      alert('Error al actualizar la sede')
    } else {
      refetch()
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 mt-1">
            Administra roles y sedes de los usuarios
          </p>
        </div>
        <AddUserButton onUserCreated={refetch} />  {/* Botón como componente separado */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Usuarios del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cambiar Rol</TableHead>
                  <TableHead>Cambiar Sede</TableHead>
                  <TableHead>Estado Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios?.map((usuario: Usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.email}
                    </TableCell>
                    <TableCell>
                      {usuario.nombre || usuario.apellido
                        ? `${usuario.nombre} ${usuario.apellido}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={usuario.rol}
                        onValueChange={(value) => actualizarRol(usuario.id, value as 'admin' | 'gerente' | 'vendedor')}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="gerente">Gerente</SelectItem>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={usuario.sede_id || 'none'}
                        onValueChange={(value) => 
                          actualizarSede(usuario.id, value === 'none' ? null : value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sin sede" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin sede</SelectItem>
                          {sedes?.map((sede) => (
                            <SelectItem key={sede.id} value={sede.id}>
                              {sede.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        usuario.rol === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : usuario.rol === 'gerente'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {usuario.rol === 'admin' ? 'Administrador' : 
                         usuario.rol === 'gerente' ? 'Gerente' : 'Vendedor'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}