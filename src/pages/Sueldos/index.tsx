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

import PageContainer from '../../components/layout/PageContainer'

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
    if (action === 'view') {
      // if row is a summary (empleado is string), fetch full recibo by id
      if (row && typeof row === 'object' && row.id && (typeof row.empleado === 'string' || !row.empleado || !row.totales)){
        sueldosService.get(row.id).then(full => { if (full) setViewing(full); else setViewing(row) })
        return
      }
      setViewing(row)
    }
    if (action === 'edit') setEditing(row)
    if (action === 'delete') handleDelete(row.id)
  }

  // compute monthly aggregations (neto) for comparativa and charts
  const monthlyData = React.useMemo(() => {
    if (!recibos || recibos.length === 0) return []
    const map = new Map<string, { label: string; neto: number; year: number; monthIndex: number }>()
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    for (const r of recibos){
      let key = ''
      let label = ''
      let year = new Date().getFullYear()
      let monthIndex = 0
      if (r.periodo && typeof r.periodo === 'object' && r.periodo.mes && r.periodo.año){
        const mesName = String(r.periodo.mes)
        const añoNum = Number(r.periodo.año) || new Date().getFullYear()
        label = `${mesName} ${añoNum}`
        key = `${añoNum}-${mesName}`
        year = añoNum
        monthIndex = months.indexOf(mesName)
        if (monthIndex < 0) monthIndex = 0
      } else if (r.fecha){
        const dt = new Date(r.fecha)
        year = dt.getFullYear()
        monthIndex = dt.getMonth()
        label = `${months[monthIndex]} ${year}`
        key = `${year}-${monthIndex}`
      } else {
        label = 'Sin periodo'
        key = 'sin'
      }

      const neto = Number(r.totales?.neto ?? r.neto ?? 0)
      if (!map.has(key)) map.set(key, { label, neto, year, monthIndex })
      else map.get(key)!.neto += neto
    }

    // sort keys by year/month desc and return last 6
    const arr = Array.from(map.values()).sort((a,b)=> (b.year - a.year) || (b.monthIndex - a.monthIndex))
    return arr.slice(0,6)
  }, [recibos])

  return (
    <PageContainer>
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
            <ComparativaMensual data={monthlyData} />
            <GraficosSueldos data={monthlyData} />
            <ErroresDetectados recibos={recibos} />
          </div>
        </div>
      </div>

      <SubirReciboModal open={openNew} onClose={()=> setOpenNew(false)} onProcessed={(r)=>{ setViewing(r); fetch() }} />

      {viewing && (
        <DetalleReciboDrawer open={!!viewing} onClose={()=> setViewing(null)} recibo={viewing} />
      )}

      {editing && (
        <DetalleReciboDrawer open={!!editing} onClose={()=> setEditing(null)} recibo={editing} />
      )}
      </div>
    </PageContainer>
  )
}

export default SueldosPage
