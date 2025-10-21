'use client'

import { useState } from 'react'
import { useCategorias } from '@/lib/hooks/useCategoria'
import { usePerfil } from '@/lib/hooks/usePerfil'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { CategoriaDialog } from '@/components/categorias/categoria-dialog'  // Ajusta la ruta

export default function CategoriasAdminPage() {
  const { categorias, isLoading, deleteCategoria, canManageCategories } = useCategorias()
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState(null)

  const filteredCategorias = categorias?.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (categoria: any) => {
    setEditingCategoria(categoria)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      await deleteCategoria.mutateAsync(id)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategoria(null)
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando categorías...</div>
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categorías</h1>
          <p className="text-slate-500 mt-1">
            Gestiona las categorías de productos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando categorías...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategorias?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      No hay categorías registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategorias?.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell className="font-medium">{categoria.nombre}</TableCell>
                      <TableCell className="max-w-md truncate">{categoria.descripcion || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(categoria)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(categoria.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoriaDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        categoria={editingCategoria}
      />
    </div>
  )
}