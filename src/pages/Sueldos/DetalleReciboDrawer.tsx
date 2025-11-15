import React, { useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import { toastInfo, toastError } from '../../components/ui'
import EnviarWhatsAppModal from '../../components/whatsapp/EnviarWhatsAppModal'
import { MessageCircle } from 'lucide-react'

export default function DetalleReciboDrawer({ open, onClose, recibo }:{ open:boolean; onClose:()=>void; recibo?: any }){
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  
  if (!open || !recibo) return null
  
  return (
    <>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="flex flex-wrap justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setWhatsappOpen(true)}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar por WhatsApp
            </Button>
            <Button onClick={()=> {
            const url = recibo.archivoOriginalUrl || ''
            if (!url) return toastInfo('No hay archivo original disponible')
            if (typeof url === 'string' && url.startsWith('data:')){
              // Descargar el PDF en lugar de abrirlo (los navegadores bloquean data: URLs)
              const link = document.createElement('a')
              link.href = url
              link.download = recibo.metadata?.nombreArchivo || 'recibo.pdf'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              toastInfo('Descargando archivo...')
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

      <EnviarWhatsAppModal
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        tipo="recibo"
        destinatario={{
          nombre: `${recibo.empleado?.nombre || ''} ${recibo.empleado?.apellido || ''}`.trim(),
          telefono: recibo.empleado?.telefono || '',
        }}
        datos={{
          periodo: `${recibo.periodo?.mes || ''} ${recibo.periodo?.año || ''}`,
          pdfUrl: recibo.archivoOriginalUrl?.startsWith('data:') ? recibo.archivoOriginalUrl : undefined,
        }}
      />
    </>
  )
}
