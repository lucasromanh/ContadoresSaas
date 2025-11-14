import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import SmartTable from '../../components/ui/SmartTable'
import { Dialog } from '../../components/ui/Dialog'
import { Form, FormField } from '../../components/ui/Form'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import proveedoresService from '../../services/proveedoresService'

export const ProveedoresPage: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const fetch = async () => {
    setLoading(true)
    const list = await proveedoresService.list()
    setData(list)
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  const handleCreate = async (payload: any) => {
    await proveedoresService.create(payload)
    setOpenNew(false)
    fetch()
  }

  const handleUpdate = async (id: string, payload: any) => {
    await proveedoresService.update(id, payload)
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar proveedor?')) return
    await proveedoresService.remove(id)
    fetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Proveedores</h2>
        <div>
          <Button onClick={() => setOpenNew(true)}>Nuevo proveedor</Button>
        </div>
      </div>

      <Card>
        <SmartTable loading={loading} columns={[{ key: 'id', label: 'ID' }, { key: 'razon_social', label: 'Razón social' }, { key: 'cuit', label: 'CUIT' }]} data={data} onAction={(action, row) => {
          if (action === 'view' || action === 'edit') setEditing(row)
          if (action === 'delete') handleDelete(row.id)
        }} />

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.slice(0, 6).map((p) => (
            <div key={p.id} className="p-2 border rounded">
              <div className="font-medium">{p.razon_social}</div>
              <div className="text-sm text-slate-500">{p.cuit}</div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setEditing(p)}>Editar</Button>
                <Button onClick={() => handleDelete(p.id)}>Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={openNew} onOpenChange={setOpenNew} title="Crear proveedor">
        <Form onSubmit={handleCreate} defaultValues={{ razon_social: '', cuit: '' }}>
          <FormField>
            <Input placeholder="Razón social" {...{ name: 'razon_social' }} />
          </FormField>
          <FormField>
            <Input placeholder="CUIT" {...{ name: 'cuit' }} />
          </FormField>
          <div className="flex gap-2 mt-3">
            <Button type="submit">Crear</Button>
            <Button onClick={() => setOpenNew(false)}>Cancelar</Button>
          </div>
        </Form>
      </Dialog>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)} title="Editar proveedor">
          <Form onSubmit={(d) => handleUpdate(editing.id, d)} defaultValues={editing}>
            <FormField>
              <Input placeholder="Razón social" {...{ name: 'razon_social' }} />
            </FormField>
            <FormField>
              <Input placeholder="CUIT" {...{ name: 'cuit' }} />
            </FormField>
            <div className="flex gap-2 mt-3">
              <Button type="submit">Guardar</Button>
              <Button onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </Form>
        </Dialog>
      )}
    </div>
  )
}

export default ProveedoresPage
