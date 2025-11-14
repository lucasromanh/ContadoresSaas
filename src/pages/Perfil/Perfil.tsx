import React, { useState } from 'react'
import PerfilView from './PerfilView'
import EditarPerfilModal from './EditarPerfilModal'

export default function PerfilPage(){
  const [editOpen, setEditOpen] = useState(false)
  return (
    <div className="p-4">
      <PerfilView onEdit={()=> setEditOpen(true)} />
      <EditarPerfilModal open={editOpen} onClose={()=> setEditOpen(false)} onSaved={()=> setEditOpen(false)} />
    </div>
  )
}
