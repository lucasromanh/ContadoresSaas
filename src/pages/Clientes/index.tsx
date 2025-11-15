import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import SmartTable from '../../components/ui/SmartTable'
import { Dialog } from '../../components/ui/Dialog'
import { Form, FormField } from '../../components/ui/Form'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import clientesService from '../../services/clientesService'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ClienteDetail from '../../components/clients/ClienteDetail'
import EnviarWhatsAppModal from '../../components/whatsapp/EnviarWhatsAppModal'
import { MessageCircle } from 'lucide-react'

// --- Forms with zod validation (module scope)
const clienteSchema = z.object({
  razon_social: z.string().min(1, 'Requerido'),
  cuit: z.string().optional(),
  email: z.string().email().optional()
})

type ClienteInput = z.infer<typeof clienteSchema>

const CreateClienteForm: React.FC<{ onCreate: (d: any) => void; onCancel: () => void }> = ({ onCreate, onCancel }) => {
  const methods = useForm<ClienteInput>({ resolver: zodResolver(clienteSchema), defaultValues: { razon_social: '', cuit: '', email: '' } })
  return (
    <Form methods={methods} onSubmit={async (d) => { await onCreate(d); methods.reset() }}>
      <FormField>
        <Input placeholder="Razón social" {...methods.register('razon_social' as any)} />
      </FormField>
      <FormField>
        <Input placeholder="CUIT" {...methods.register('cuit' as any)} />
      </FormField>
      <FormField>
        <Input placeholder="Email" {...methods.register('email' as any)} />
      </FormField>
      <div className="flex gap-2 mt-3">
        <Button type="submit">Crear</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </Form>
  )
}

const EditClienteForm: React.FC<{ initial: any; onSave: (d: any) => void; onCancel: () => void }> = ({ initial, onSave, onCancel }) => {
  const methods = useForm<ClienteInput>({ resolver: zodResolver(clienteSchema), defaultValues: initial })
  return (
    <Form methods={methods} onSubmit={async (d) => { await onSave(d); methods.reset() }}>
      <FormField>
        <Input placeholder="Razón social" {...methods.register('razon_social' as any)} />
      </FormField>
      <FormField>
        <Input placeholder="CUIT" {...methods.register('cuit' as any)} />
      </FormField>
      <FormField>
        <Input placeholder="Email" {...methods.register('email' as any)} />
      </FormField>
      <div className="flex gap-2 mt-3">
        <Button type="submit">Guardar</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </Form>
  )
}

const ClientCards: React.FC<{ data: any[]; onView: (id: string)=>void; onEdit: (c:any)=>void; onDelete: (id:string)=>void; onWhatsApp: (c:any)=>void }> = ({ data, onView, onEdit, onDelete, onWhatsApp }) => {
  const navigate = useNavigate()
  return (
    <div className="mt-3 flex gap-2">
      {data.map((c) => (
        <div key={c.id} className="p-2 border rounded w-full">
          <div className="font-medium">{c.razon_social}</div>
          <div className="text-sm text-slate-500">{c.cuit}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button onClick={() => onView(c.id)}>Ver</Button>
            <Button onClick={() => onEdit(c)}>Editar</Button>
            <Button onClick={() => onDelete(c.id)}>Eliminar</Button>
            <Button variant="outline" onClick={() => onWhatsApp(c)} className="gap-1">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button onClick={() => navigate(`/documentos?clientId=${c.id}&clientName=${encodeURIComponent(c.razon_social || c.nombre)}`)}>Carpeta documental</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

import PageContainer from '../../components/layout/PageContainer'

export const ClientesPage: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [whatsappCliente, setWhatsappCliente] = useState<any | null>(null)

  const fetch = async () => {
    setLoading(true)
    const list = await clientesService.list()
    setData(list)
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  const handleCreate = async (payload: any) => {
    await clientesService.create(payload)
    setOpenNew(false)
    fetch()
  }

  const handleUpdate = async (id: string, payload: any) => {
    await clientesService.update(id, payload)
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar cliente?')) return
    await clientesService.remove(id)
    fetch()
  }

  const handleWhatsApp = (cliente: any) => {
    setWhatsappCliente(cliente)
    setWhatsappOpen(true)
  }

  return (
    <PageContainer>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Clientes</h2>
        <div>
          <Button onClick={() => setOpenNew(true)}>Nuevo cliente</Button>
        </div>
      </div>

      <Card>
        <SmartTable
          loading={loading}
          columns={[
            { key: 'id', label: 'ID', sortable: true },
            { key: 'razon_social', label: 'Razón social', sortable: true },
            { key: 'cuit', label: 'CUIT' },
            { key: 'estado', label: 'Estado' }
          ]}
          data={data}
          onAction={(action, row) => {
            if (action === 'view') setDetailId(row.id)
            if (action === 'edit') setEditing(row)
            if (action === 'delete') handleDelete(row.id)
            if (action === 'import') {
              // imported rows: create them
              ;(row as any[]).forEach(async (r: any) => { await clientesService.create(r) })
              fetch()
            }
          }}
          searchKeys={['razon_social', 'cuit']}
          stateKey={'estado'}
        />
        <ClientCards data={data.slice(0,5)} onView={(id)=>setDetailId(id)} onEdit={(c)=>setEditing(c)} onDelete={(id)=>handleDelete(id)} onWhatsApp={handleWhatsApp} />
      </Card>

      <Dialog open={openNew} onOpenChange={setOpenNew} title="Crear cliente">
        {/* Zod schema + react-hook-form */}
        <CreateClienteForm onCreate={handleCreate} onCancel={() => setOpenNew(false)} />
      </Dialog>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)} title="Editar cliente">
          <EditClienteForm initial={editing} onSave={(d) => handleUpdate(editing.id, d)} onCancel={() => setEditing(null)} />
        </Dialog>
      )}
      {detailId && <ClienteDetail id={detailId} open={!!detailId} onOpenChange={(v) => !v && setDetailId(null)} />}
      
      <EnviarWhatsAppModal
        open={whatsappOpen}
        onClose={() => { setWhatsappOpen(false); setWhatsappCliente(null) }}
        tipo="custom"
        destinatario={{
          nombre: whatsappCliente?.razon_social || whatsappCliente?.nombre || '',
          telefono: whatsappCliente?.telefono || '',
        }}
      />
      </div>
    </PageContainer>
  )
}

