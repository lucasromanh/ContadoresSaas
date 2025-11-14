import React from 'react'
import { Vencimiento } from './services/vencimientosService'

export default function ModalDiaVencimientos({ date, items, onClose, onMark, onView, onSend }:
  { date: string; items: Vencimiento[]; onClose: ()=>void; onMark: (id:string, estado: Vencimiento['estado'])=>void; onView: (v:Vencimiento)=>void; onSend: (cliente?: string)=>void }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-[90%] max-w-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-semibold">Eventos — {date}</div>
            <div className="text-sm text-slate-500">{items.length} evento(s)</div>
          </div>
          <div>
            <button onClick={onClose} className="px-3 py-1 border rounded">Cerrar</button>
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {items.map(it => (
            <div key={it.id} className="p-2 border rounded bg-slate-100 dark:bg-slate-900 flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{it.descripcion}</div>
                <div className="text-xs text-slate-500 truncate">{it.tipo} • {it.organismo} • {it.cliente} — {it.cuit}</div>
                <div className="text-xs text-slate-600 mt-1">Estado: <span className="font-medium">{it.estado}</span> • Criticidad: <span className="font-medium">{it.criticidad}</span></div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <div className="flex gap-2">
                  <button onClick={()=> onView(it)} className="px-2 py-1 text-sm text-primary border rounded">Ver</button>
                  <button onClick={()=> onMark(it.id, 'presentado')} className="px-2 py-1 text-sm border rounded">Marcar presentado</button>
                  <button onClick={()=> onMark(it.id, 'pagado')} className="px-2 py-1 text-sm border rounded">Marcar pagado</button>
                </div>
                <div>
                  <button onClick={()=> onSend(it.cliente)} className="px-2 py-1 text-sm btn-primary">Enviar recordatorio</button>
                </div>
              </div>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-slate-500">No hay eventos para este día.</div>}
        </div>
      </div>
    </div>
  )
}
