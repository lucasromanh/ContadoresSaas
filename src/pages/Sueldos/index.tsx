import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import SmartTable from '../../components/ui/SmartTable'
import { Dialog } from '../../components/ui/Dialog'
import { Form, FormField } from '../../components/ui/Form'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import sueldosService from '../../services/sueldosService'
import { useForm, Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// --- Sueldos forms and schema (moved out of component)
const sueldoSchema = z.object({
  empleado: z.string().min(1, 'Requerido'),
  cuil: z.string().optional(),
  bruto: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().min(0))
})

type SueldoInput = z.infer<typeof sueldoSchema>

const CreateSueldoForm: React.FC<{ onCreate: (d: any) => void; onCancel: () => void }> = ({ onCreate, onCancel }) => {
  const methods = useForm<SueldoInput>({ resolver: zodResolver(sueldoSchema) as unknown as Resolver<SueldoInput>, defaultValues: { empleado: '', cuil: '', bruto: 0 } })
  return (
    <Form methods={methods} onSubmit={async (d) => { await onCreate(d); methods.reset() }}>
      <FormField>
        <Input placeholder="Empleado" {...methods.register('empleado' as any)} />
      </FormField>
      <FormField>
        <Input placeholder="CUIL" {...methods.register('cuil' as any)} />
      </FormField>
      <FormField>
        <Input type="number" placeholder="Bruto" {...methods.register('bruto' as any)} />
      </FormField>
      <div className="flex gap-2 mt-3">
        <Button type="submit">Crear</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </Form>
  )
}

const EditSueldoForm: React.FC<{ initial: any; onSave: (d: any) => void; onCancel: () => void }> = ({ initial, onSave, onCancel }) => {
  const methods = useForm<SueldoInput>({ resolver: zodResolver(sueldoSchema) as unknown as Resolver<SueldoInput>, defaultValues: initial })
  return (
    <Form methods={methods} onSubmit={async (d) => { await onSave(d); methods.reset() }}>
      <div className="space-y-3">
        <div>Bruto: {initial.bruto}</div>
        <div>Cargas sociales: {initial.cargas_sociales}</div>
        <div>Neto: {initial.neto}</div>
        <FormField>
          <Input placeholder="Empleado" {...methods.register('empleado' as any)} />
        </FormField>
        <FormField>
          <Input placeholder="CUIL" {...methods.register('cuil' as any)} />
        </FormField>
        <FormField>
          <Input type="number" placeholder="Bruto" {...methods.register('bruto' as any)} />
        </FormField>
        <div className="flex gap-2 mt-3">
          <Button type="submit">Guardar</Button>
          <Button onClick={onCancel}>Cancelar</Button>
        </div>
        <div>
          <div className="text-sm text-slate-500">Subir recibo PDF</div>
          <input type="file" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await sueldosService.uploadReceipt(initial.id, f); } }} />
        </div>
      </div>
    </Form>
  )
}

export const SueldosPage: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const fetch = async () => {
    setLoading(true)
    const list = await sueldosService.list()
    setData(list)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleCreate = async (payload: any) => { await sueldosService.create(payload); setOpenNew(false); fetch() }
  const handleUpdate = async (id: string, payload: any) => { await sueldosService.update(id, payload); setEditing(null); fetch() }
  const handleDelete = async (id: string) => { if (!confirm('¿Eliminar liquidación?')) return; await sueldosService.remove(id); fetch() }

  const handleAction = (action: string, row: any) => {
    if (action === 'view') setEditing(row)
    if (action === 'edit') setEditing(row)
    if (action === 'delete') handleDelete(row.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sueldos</h2>
        <div>
          <Button onClick={() => setOpenNew(true)}>Nueva liquidación</Button>
        </div>
      </div>

      <Card>
        <SmartTable loading={loading} columns={[{ key: 'id', label: 'ID' }, { key: 'empleado', label: 'Empleado', sortable: true }, { key: 'fecha', label: 'Fecha', sortable: true }, { key: 'bruto', label: 'Bruto', sortable: true }]} data={data} onAction={(action, row) => {
          if (action === 'view' || action === 'edit') setEditing(row)
          if (action === 'delete') handleDelete(row.id)
          if (action === 'import') { (row as any[]).forEach(async (r: any) => { await sueldosService.create({ empleado: r.empleado, bruto: Number(r.bruto || 0) }) }); fetch() }
        }} searchKeys={['empleado']} stateKey={'fecha'} />
      </Card>

      <Dialog open={openNew} onOpenChange={setOpenNew} title="Nueva liquidación">
        <CreateSueldoForm onCreate={handleCreate} onCancel={() => setOpenNew(false)} />
      </Dialog>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)} title={`Liquidación — ${editing.empleado}`}>
          <EditSueldoForm initial={editing} onSave={(d) => handleUpdate(editing.id, d)} onCancel={() => setEditing(null)} />
        </Dialog>
      )}
    </div>
  )
}

export default SueldosPage
