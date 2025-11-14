import React from 'react'
import { Alerta } from './services/alertasService'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'

export default function DrawerDetalleAlerta({ alerta, open, onOpenChange, onMark, onSend }:{ alerta: Alerta | null; open: boolean; onOpenChange: (v:boolean)=>void; onMark?: (id:string, estado:any)=>void; onSend?: (cliente?:string)=>void }){
  if (!alerta) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={alerta.titulo} description={alerta.descripcion}>
      <div>
        <div className="text-sm text-slate-600 mb-2">Tipo: {alerta.tipo} • Criticidad: {alerta.criticidad}</div>
        <div className="text-sm text-slate-700 mb-4">{alerta.descripcion}</div>
        <div className="space-y-2">
          <Button variant="ghost" onClick={()=> onMark && onMark(alerta.id, 'resuelta')}>Marcar resuelta</Button>
          <Button variant="ghost" onClick={()=> onMark && onMark(alerta.id, 'leida')}>Marcar leída</Button>
          <Button variant="outline" onClick={()=> onSend && onSend(alerta.cliente)}>Enviar recordatorio</Button>
        </div>
        <div className="mt-4 text-xs text-slate-500">Historial:</div>
        <div className="mt-2 space-y-1 text-xs">
          {(alerta.historial || []).map((h, idx)=> (
            <div key={idx} className="border rounded p-2 bg-slate-50 dark:bg-slate-900">{new Date(h.cuando).toLocaleString()} — {h.accion} {h.nota ? `: ${h.nota}` : ''}</div>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
