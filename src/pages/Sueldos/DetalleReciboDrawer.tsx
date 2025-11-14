import React from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import { toastInfo, toastError } from '../../components/ui'

export default function DetalleReciboDrawer({ open, onClose, recibo }:{ open:boolean; onClose:()=>void; recibo?: any }){
  if (!open || !recibo) return null
  return (
    <Dialog open={open} onOpenChange={(v)=> !v && onClose()} title={`Recibo — ${recibo.empleado?.nombre || recibo.empleado}`}>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-slate-100 rounded flex items-center justify-center">Foto</div>
          <div>
            <div className="text-lg font-semibold">{recibo.empleado?.nombre} {recibo.empleado?.apellido || ''}</div>
            <div className="text-sm text-slate-500">CUIL: {recibo.empleado?.cuil}</div>
            <div className="text-sm">Empleador: {recibo.empleador?.razonSocial}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="font-semibold">Haberes</h4>
            <ul className="list-disc ml-5">
              {(recibo.conceptos || []).filter((c:any)=> (c.haberes||0)>0).map((c:any, i:number)=>(<li key={i}>{c.descripcion}: ${c.haberes}</li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Deducciones</h4>
            <ul className="list-disc ml-5">
              {(recibo.conceptos || []).filter((c:any)=> (c.deducciones||0)>0).map((c:any, i:number)=>(<li key={i}>{c.descripcion}: ${c.deducciones}</li>))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Totales</h4>
          <div>Haberes: ${recibo.totales?.totalHaberes}</div>
          <div>Deducciones: ${recibo.totales?.totalDeducciones}</div>
          <div className="text-xl font-bold">Neto: ${recibo.totales?.neto}</div>
        </div>

        {recibo.observaciones?.length > 0 && (
          <div className="p-2 bg-amber-50 rounded">
            <strong>Observaciones:</strong>
            <ul className="list-disc ml-5">{recibo.observaciones.map((o:any,i:number)=>(<li key={i}>{o}</li>))}</ul>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={()=> {
            const url = recibo.archivoOriginalUrl || ''
            if (!url) return toastInfo('No hay archivo original disponible')
            if (typeof url === 'string' && url.startsWith('data:')){
              window.open(url, '_blank')
            } else if (typeof url === 'string' && url.startsWith('file:')){
              // we stored a lightweight reference for large files instead of inlining base64
              const name = url.replace(/^file:/,'')
              toastInfo('Archivo guardado como referencia: ' + name)
            } else {
              try{ window.open(url, '_blank') }catch(e){ toastError('No se puede abrir el archivo') }
            }
          }}>Ver original</Button>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Dialog>
  )
}
