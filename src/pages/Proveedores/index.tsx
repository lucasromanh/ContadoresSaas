import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import SmartTable from '../../components/ui/SmartTable'
import { Dialog } from '../../components/ui/Dialog'
import { Form, FormField } from '../../components/ui/Form'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import proveedoresService from '../../services/proveedoresService'

import PageContainer from '../../components/layout/PageContainer'

export const ProveedoresPage: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [viewing, setViewing] = useState<any | null>(null)

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
    <PageContainer>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Proveedores</h2>
        <div>
          <Button onClick={() => setOpenNew(true)}>Nuevo proveedor</Button>
        </div>
      </div>

      <Card>
        <SmartTable loading={loading} columns={[{ key: 'id', label: 'ID' }, { key: 'razon_social', label: 'Razón social' }, { key: 'cuit', label: 'CUIT' }]} data={data} onAction={(action, row) => {
          if (action === 'view') setViewing(row)
          if (action === 'edit') setEditing(row)
          if (action === 'delete') handleDelete(row.id)
        }} />

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.slice(0, 6).map((p) => (
            <div key={p.id} className="p-2 border rounded">
              <div className="font-medium">{p.razon_social}</div>
              <div className="text-sm text-slate-500">{p.cuit}</div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setViewing(p)}>Ver</Button>
                <Button onClick={() => setEditing(p)}>Editar</Button>
                <Button onClick={() => handleDelete(p.id)}>Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {viewing && (
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)} title="Proveedor">
          <div className="space-y-3">
            <div className="text-lg font-semibold">{viewing.razon_social}</div>
            <div className="text-sm text-slate-600">CUIT: {viewing.cuit || '-'}</div>
            {viewing.percepciones_iva?.length > 0 && (
              <div><strong>Percepciones IVA:</strong> {viewing.percepciones_iva.join(', ')}</div>
            )}
            {viewing.percepciones_iibb?.length > 0 && (
              <div><strong>Percepciones IIBB:</strong> {viewing.percepciones_iibb.join(', ')}</div>
            )}
            {viewing.retenciones?.length > 0 && (
              <div><strong>Retenciones:</strong> {viewing.retenciones.join(', ')}</div>
            )}
            {viewing.notas && (
              <div><strong>Notas:</strong> <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded">{viewing.notas}</div></div>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={() => { setEditing(viewing); setViewing(null) }}>Editar</Button>
              <Button variant="outline" onClick={() => setViewing(null)}>Cerrar</Button>
            </div>
          </div>
        </Dialog>
      )}

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
    </PageContainer>
  )
}

export default ProveedoresPage
