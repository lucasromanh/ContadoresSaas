import React from 'react'
import { Alerta } from './services/alertasService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Bell, AlertTriangle, FileText, Users, MessageCircle } from 'lucide-react'

function iconFor(tipo: Alerta['tipo']){
  switch(tipo){
    case 'vencimiento': return <Bell size={18} />
    case 'factura': return <FileText size={18} />
    case 'proveedor': return <Users size={18} />
    default: return <AlertTriangle size={18} />
  }
}

export default function TarjetaAlerta({ alerta, onView, onMark, onSend, onWhatsApp }:{ alerta: Alerta; onView?: (a:Alerta)=>void; onMark?: (id:string, estado: any)=>void; onSend?: (cliente?:string)=>void; onWhatsApp?: (a:Alerta)=>void }){
  return (
    <Card className="w-full p-0">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4">
        <div className="p-2 sm:p-3 rounded bg-slate-200 dark:bg-slate-700 self-start sm:self-stretch flex items-center justify-center">
          {iconFor(alerta.tipo)}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <div className="font-semibold truncate text-sm sm:text-base">{alerta.titulo}</div>
            <div className="text-xs text-slate-500 whitespace-nowrap">{new Date(alerta.fecha).toLocaleDateString()}</div>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{alerta.descripcion}</div>
          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${alerta.criticidad==='alta'?'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100': alerta.criticidad==='media'?'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100':'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>{alerta.criticidad}</span>
            {/* estado pill */}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${alerta.estado==='urgente' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : alerta.estado==='resuelta' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' : alerta.estado==='leida' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' : 'bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100'}`}>{alerta.estado.toUpperCase()}</span>
            {(alerta.cuit || alerta.cliente || alerta.proveedor) && <div className="text-xs text-slate-500 truncate">{alerta.cliente || alerta.proveedor || alerta.cuit}</div>}
          </div>
          {/* Botones en móvil - debajo del contenido */}
          <div className="sm:hidden mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={()=> onView && onView(alerta)}>Ver detalle</Button>
            {alerta.estado !== 'resuelta' ? (
              <Button size="sm" variant="outline" onClick={()=> onMark && onMark(alerta.id, 'resuelta')}>Marcar resuelta</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={()=> onMark && onMark(alerta.id, 'pendiente')}>Reabrir</Button>
            )}
            {alerta.estado !== 'leida' && (
              <Button size="sm" variant="ghost" onClick={()=> onMark && onMark(alerta.id, 'leida')}>Marcar leída</Button>
            )}
            <Button size="sm" variant="default" onClick={()=> onSend && onSend(alerta.cliente || alerta.proveedor || alerta.cuit)}>Recordar</Button>
            <Button size="sm" variant="outline" onClick={()=> onWhatsApp && onWhatsApp(alerta)} className="gap-1">
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </Button>
          </div>
        </div>
        {/* Botones en desktop - a la derecha */}
        <div className="hidden sm:flex flex-col items-end gap-2 justify-center">
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
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="default" onClick={()=> onSend && onSend(alerta.cliente || alerta.proveedor || alerta.cuit)}>Recordar</Button>
            <Button size="sm" variant="outline" onClick={()=> onWhatsApp && onWhatsApp(alerta)} className="gap-1">
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
