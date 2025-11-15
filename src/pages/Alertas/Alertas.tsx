import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import alertasService, { Alerta } from './services/alertasService'
import perfilService from '../../services/perfilService'
import ListadoAlertas from './ListadoAlertas'
import FiltrosAlertas from './FiltrosAlertas'
import DrawerDetalleAlerta from './DrawerDetalleAlerta'
import CrearAlertaModal from './CrearAlertaModal'
import GeneradorAlertas from '../Vencimientos/GeneradorAlertas'

export default function AlertasPage(){
  const [items, setItems] = useState<Alerta[]>([])
  const [filter, setFilter] = useState<any>({})
  const [selected, setSelected] = useState<Alerta|null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [sendCliente, setSendCliente] = useState<string|undefined>(undefined)
  const [showResueltas, setShowResueltas] = useState(false)
  const [perfilPhone, setPerfilPhone] = useState<string | null>(null)

  useEffect(()=>{
    alertasService.loadMock().then(d=> setItems(d))
    alertasService.runRules()
    perfilService.getFresh().then(p=>{
      if (p?.contacto?.telefonoPersonal) setPerfilPhone(p.contacto.telefonoPersonal)
    })
  },[])

  function applyFilter(f:any){ setFilter(f) }

  function filtered(){
    let list = items
    if (filter.tipo) list = list.filter(i=>i.tipo===filter.tipo)
    if (filter.criticidad) list = list.filter(i=>i.criticidad===filter.criticidad)
    if (filter.estado) list = list.filter(i=>i.estado===filter.estado)
    if (filter.q) list = list.filter(i=> (i.cliente||i.proveedor||i.cuit||'').toLowerCase().includes(filter.q.toLowerCase()))
    // by default hide resolved alerts from main panel; showResueltas toggle will include them
    // but if the user explicitly filters by estado='resuelta', show them
    if (!showResueltas && filter.estado !== 'resuelta') list = list.filter(i => i.estado !== 'resuelta')
    return list
  }

  function reload(){ setItems([...alertasService.getAll()]) }

  function onCreate(a: Partial<Alerta>){
    alertasService.create(a)
    reload()
  }

  function onMark(id:string, estado:any){
    alertasService.markAs(id, estado)
    reload()
  }

  function onSend(cliente?:string){
    setSendCliente(cliente)
    setShowSend(true)
  }

  function markAllRead(){
    alertasService.markAllRead()
    reload()
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Alertas</h2>
      <Card>
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <FiltrosAlertas onApply={applyFilter} />
              <div className="text-sm text-slate-600">Total: <span className="font-semibold">{items.length}</span></div>
              <div className="text-sm text-amber-700">Pendientes: <span className="font-semibold">{items.filter(i=>i.estado==='pendiente').length}</span></div>
              <div className="text-sm text-red-600">Urgentes: <span className="font-semibold">{items.filter(i=>i.estado==='urgente').length}</span></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={markAllRead}>Marcar todo leído</Button>
              <Button variant="info" onClick={()=> setShowResueltas(v=>!v)}>{showResueltas ? 'Ocultar resueltas' : 'Ver resueltas'}</Button>
              {perfilPhone && <Button variant="ghost" onClick={()=> onSend(perfilPhone)}>Enviar al contador</Button>}
              <Button variant="success" onClick={()=>setShowCreate(true)}>Crear alerta</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ListadoAlertas items={filtered()} onView={(a)=>setSelected(a)} onMark={onMark} onSend={onSend} />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Resumen</h3>
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Total alertas: {items.length}</div>
              <div className="text-sm text-slate-600">Pendientes: {items.filter(i=>i.estado==='pendiente').length}</div>
              <div className="text-sm text-slate-600">Urgentes: {items.filter(i=>i.estado==='urgente').length}</div>
            </div>
          </div>
        </div>
      </Card>

      <DrawerDetalleAlerta alerta={selected} open={!!selected} onOpenChange={(v)=>{ if (!v) setSelected(null) }} onMark={onMark} onSend={onSend} />
      <CrearAlertaModal open={showCreate} onClose={()=>setShowCreate(false)} onCreate={onCreate} />
      {showSend && <GeneradorAlertas onClose={()=>{ setShowSend(false); setSendCliente(undefined) }} initialCliente={sendCliente} />}
    </div>
  )
}
