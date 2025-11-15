import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import TablaVencimientos from './TablaVencimientos'
import CalendarioVencimientos from './CalendarioVencimientos'
import TarjetaVencimiento from './TarjetaVencimiento'
import FiltrosVencimientos from './FiltrosVencimientos'
import DetalleVencimientoDrawer from './DetalleVencimientoDrawer'
import GeneradorAlertas from './GeneradorAlertas'
import TimelineVencimientos from './TimelineVencimientos'
import ModalDiaVencimientos from './ModalDiaVencimientos'
import vencimientosService, { Vencimiento } from './services/vencimientosService'
import EnviarWhatsAppModal from '../../components/whatsapp/EnviarWhatsAppModal'

export default function VencimientosPage(){
  const [items, setItems] = useState<Vencimiento[]>([])
  const [filter, setFilter] = useState<any>({})
  const [selected, setSelected] = useState<Vencimiento|null>(null)
  const [showModal, setShowModal] = useState(false)
  const [dayModal, setDayModal] = useState<{ date: string; items: Vencimiento[] } | null>(null)
  const [alertInitialCliente, setAlertInitialCliente] = useState<string|undefined>(undefined)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [whatsappVencimiento, setWhatsappVencimiento] = useState<Vencimiento | null>(null)

  useEffect(()=>{
    vencimientosService.loadMock().then((d)=> setItems(d))
    // run check for overdue
    vencimientosService.checkAndAlertOverdue()
  },[])

  function applyFilter(f:any){ setFilter(f) }

  function filtered(){
    if (!filter || Object.keys(filter).length===0) return items
    return items.filter((it)=>{
      if (filter.cuit && !it.cuit?.includes(filter.cuit)) return false
      if (filter.cliente && !it.cliente?.toLowerCase().includes(filter.cliente.toLowerCase())) return false
      if (filter.tipo && filter.tipo!=='' && it.tipo!==filter.tipo) return false
      if (filter.estado && filter.estado!=='' && it.estado!==filter.estado) return false
      if (filter.provincia && it.provincia !== filter.provincia) return false
      return true
    })
  }

  function onMark(id:string, estado: Vencimiento['estado']){
    vencimientosService.markAs(id, estado)
    setItems([...vencimientosService.getAll()])
  }

  function onWhatsApp(vencimiento: Vencimiento){
    setWhatsappVencimiento(vencimiento)
    setWhatsappOpen(true)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Vencimientos</h2>
      <Card>
        <div className="mb-4">
          <FiltrosVencimientos onApply={applyFilter} onSendReminder={() => setShowModal(true)} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CalendarioVencimientos items={filtered()} onEventClick={(it: Vencimiento)=>setSelected(it)} onDayClick={(date: string, items: Vencimiento[])=> setDayModal({ date, items })} />
            <div className="mt-4">
              <TimelineVencimientos items={filtered()} />
            </div>
            <div className="mt-4">
              <TablaVencimientos items={filtered()} onViewDetail={(it: Vencimiento)=>setSelected(it)} onMark={onMark} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Proximos vencimientos</h3>
            <div className="space-y-2">
              {filtered().slice(0,6).map((it)=> (
                <TarjetaVencimiento key={it.id} item={it} onView={() => setSelected(it)} onSend={() => { setSelected(it); setShowModal(true) }} onWhatsApp={() => onWhatsApp(it)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

  {selected && <DetalleVencimientoDrawer item={selected} onClose={()=>setSelected(null)} onMark={onMark} />}
  {showModal && <GeneradorAlertas onClose={()=>setShowModal(false)} initialCliente={alertInitialCliente || filter.cliente || selected?.cliente} />}
  {dayModal && <>
    <ModalDiaVencimientos date={dayModal.date} items={dayModal.items} onClose={()=> setDayModal(null)} onMark={(id: string, estado: Vencimiento['estado'])=>{ onMark(id, estado); setDayModal(null) }} onView={(v: Vencimiento)=>{ setSelected(v); setDayModal(null) }} onSend={(cliente?: string)=>{ setAlertInitialCliente(cliente); setShowModal(true); setDayModal(null) }} />
  </>}
  
  <EnviarWhatsAppModal
    open={whatsappOpen}
    onClose={() => { setWhatsappOpen(false); setWhatsappVencimiento(null) }}
    tipo="alerta"
    destinatario={{
      nombre: whatsappVencimiento?.cliente || '',
      telefono: '', // Aquí deberías tener el teléfono del cliente
    }}
    datos={{
      concepto: whatsappVencimiento?.descripcion || '',
      fecha: whatsappVencimiento?.fecha || '',
    }}
  />
    </div>
  )
}
