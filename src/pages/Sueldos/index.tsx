import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import sueldosService from '../../services/sueldosService'
import SubirReciboModal from './SubirReciboModal'
import TablaSueldos from './TablaSueldos'
import DetalleReciboDrawer from './DetalleReciboDrawer'
import ComparativaMensual from './ComparativaMensual'
import GraficosSueldos from './GraficosSueldos'
import ErroresDetectados from './ErroresDetectados'

export const SueldosPage: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [viewing, setViewing] = useState<any | null>(null)
  const [recibos, setRecibos] = useState<any[]>([])

  const fetch = async () => {
    setLoading(true)
    const list = await sueldosService.list()
    setData(list)
    setRecibos(list)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleCreate = async (payload: any) => { await sueldosService.createManual(payload); setOpenNew(false); fetch() }
  const handleUpdate = async (id: string, payload: any) => { await sueldosService.update(id, payload); setEditing(null); fetch() }
  const handleDelete = async (id: string) => { if (!confirm('¿Eliminar liquidación?')) return; await sueldosService.remove(id); fetch() }

  const handleAction = (action: string, row: any) => {
    if (action === 'view') setViewing(row)
    if (action === 'edit') setEditing(row)
    if (action === 'delete') handleDelete(row.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sueldos</h2>
        <div>
          <Button onClick={() => setOpenNew(true)}>Subir recibo</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <TablaSueldos data={data} onAction={handleAction} />
          </Card>
        </div>
        <div>
          <div className="space-y-4">
            <ComparativaMensual data={[{ label: 'Mes A', neto: 90000 }, { label: 'Mes B', neto: 94000 }]} />
            <GraficosSueldos />
            <ErroresDetectados recibos={recibos} />
          </div>
        </div>
      </div>

      <SubirReciboModal open={openNew} onClose={()=> setOpenNew(false)} onProcessed={(r)=>{ setViewing(r); fetch() }} />

      {viewing && (
        <DetalleReciboDrawer open={!!viewing} onClose={()=> setViewing(null)} recibo={viewing} />
      )}

      {editing && (
        <DetalleReciboDrawer open={!!editing} onOpenChange={()=> setEditing(null)} recibo={editing} />
      )}
    </div>
  )
}

export default SueldosPage
