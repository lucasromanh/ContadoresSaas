import React from 'react'
import { Vencimiento } from './services/vencimientosService'
import { Card } from '../../components/ui/Card'
import { Bell } from 'lucide-react'

export default function TarjetaVencimiento({ item, onView, onSend }: { item: Vencimiento; onView?: ()=>void; onSend?: ()=>void }){
  const color = item.criticidad==='alta' ? 'bg-red-600' : item.criticidad==='media' ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{item.tipo} • {item.organismo}</div>
          <div className="font-semibold">{item.descripcion}</div>
          <div className="text-xs text-slate-500">{item.cliente} — {item.cuit}</div>
          <div className="text-sm mt-2">{item.fecha} • <span className={`px-2 py-0.5 rounded text-white ${color}`}> {item.criticidad}</span></div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onView} className="text-sm text-primary">Ver detalle</button>
          <button onClick={onSend} className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1"><Bell size={14}/> Enviar</button>
        </div>
      </div>
    </Card>
  )
}
