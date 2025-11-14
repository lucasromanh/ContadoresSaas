import React from 'react'
import Sheet from '../../components/ui/Sheet'
import { Vencimiento } from './services/vencimientosService'
import { Button } from '../../components/ui/Button'

export default function DetalleVencimientoDrawer({ item, onClose, onMark }: { item: Vencimiento | null; onClose: ()=>void; onMark?: (id:string, estado: Vencimiento['estado'])=>void }){
  if (!item) return null
  return (
    <Sheet open={!!item} onOpenChange={(v)=> !v && onClose()} title={`Detalle ${item.descripcion}`} description={item.organismo}>
      <div className="space-y-3 text-slate-700 dark:text-slate-200">
        <div><strong>Cliente:</strong> {item.cliente} — {item.cuit}</div>
        <div><strong>Tipo:</strong> {item.tipo}</div>
        <div><strong>Fecha límite:</strong> {item.fecha}</div>
        <div><strong>Estado:</strong> {item.estado}</div>
        <div><strong>Provincia:</strong> {item.provincia}</div>
        <div><strong>Comprobantes relacionados:</strong> {item.relacionadoCon?.comprobantes?.join(', ') || '—'}</div>
        <div className="flex gap-2 mt-2">
          <Button variant="default" onClick={()=> onMark && onMark(item.id, 'presentado')}>Marcar como presentado</Button>
          <Button variant="outline" onClick={()=> onMark && onMark(item.id, 'pagado')}>Marcar como pagado</Button>
          <Button variant="ghost" onClick={()=> { window.open(`https://wa.me/549${(item.cuit||'').replace(/[^0-9]/g,'')}`, '_blank') }}>Enviar WhatsApp</Button>
        </div>
      </div>
    </Sheet>
  )
}
