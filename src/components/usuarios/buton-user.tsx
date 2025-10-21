'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { UserDialog } from './usuario-dialog'

interface AddUserButtonProps {
  onUserCreated?: () => void  
}

export function AddUserButton({ onUserCreated }: AddUserButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleUserCreated = () => {
    onUserCreated?.()  // Llama al callback si se proporciona
    handleCloseDialog()
  }

  return (
    <>
      <Button onClick={handleOpenDialog} className="cursor-pointer">
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Usuario
      </Button>
      <UserDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onUserCreated={handleUserCreated}
      />
    </>
  )
}