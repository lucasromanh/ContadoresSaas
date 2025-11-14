import React from 'react'
import { Alerta } from './services/alertasService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Bell, AlertTriangle, FileText, Users } from 'lucide-react'

function iconFor(tipo: Alerta['tipo']){
  switch(tipo){
    case 'vencimiento': return <Bell size={18} />
    case 'factura': return <FileText size={18} />
    case 'proveedor': return <Users size={18} />
    default: return <AlertTriangle size={18} />
  }
}

export default function TarjetaAlerta({ alerta, onView, onMark, onSend }:{ alerta: Alerta; onView?: (a:Alerta)=>void; onMark?: (id:string, estado: any)=>void; onSend?: (cliente?:string)=>void }){
  return (
    <Card className="w-full p-0">
      <div className="flex items-start gap-4 p-4">
        <div className="p-3 rounded bg-slate-200 dark:bg-slate-700 self-stretch flex items-center justify-center">
          {iconFor(alerta.tipo)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold truncate">{alerta.titulo}</div>
            <div className="text-xs text-slate-500">{new Date(alerta.fecha).toLocaleDateString()}</div>
          </div>
          <div className="text-sm text-slate-600 mt-1">{alerta.descripcion}</div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${alerta.criticidad==='alta'?'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100': alerta.criticidad==='media'?'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100':'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>{alerta.criticidad}</span>
            {/* estado pill */}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ml-2 ${alerta.estado==='urgente' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : alerta.estado==='resuelta' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' : alerta.estado==='leida' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' : 'bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100'}`}>{alerta.estado.toUpperCase()}</span>
            {(alerta.cuit || alerta.cliente || alerta.proveedor) && <div className="text-xs text-slate-500 ml-2">{alerta.cliente || alerta.proveedor || alerta.cuit}</div>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 justify-center">
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="ghost" onClick={()=> onView && onView(alerta)}>Ver detalle</Button>
            {alerta.estado !== 'resuelta' ? (
              <Button size="sm" variant="outline" onClick={()=> onMark && onMark(alerta.id, 'resuelta')}>Marcar resuelta</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={()=> onMark && onMark(alerta.id, 'pendiente')}>Reabrir</Button>
            )}
            {alerta.estado !== 'leida' && (
              <Button size="sm" variant="ghost" onClick={()=> onMark && onMark(alerta.id, 'leida')}>Marcar leída</Button>
            )}
          </div>
          <div>
            <Button size="sm" variant="default" onClick={()=> onSend && onSend(alerta.cliente || alerta.proveedor || alerta.cuit)}>{'Recordar'}</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
