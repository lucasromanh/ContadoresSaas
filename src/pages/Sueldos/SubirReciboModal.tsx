import React, { useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import sueldosService from '../../services/sueldosService'
import Input from '../../components/ui/Input'

export default function SubirReciboModal({ open, onClose, onProcessed }: { open: boolean; onClose: ()=>void; onProcessed?: (r:any)=>void }){
  const [file, setFile] = useState<File|null>(null)
  const [empleado, setEmpleado] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [parsed, setParsed] = useState<any|null>(null)
  const [showFull, setShowFull] = useState(false)

  const handleProcess = async () => {
    if (!file) return alert('Sube un archivo primero')
    setProcessing(true)
    setProgress(10)
    try{
      const res = await sueldosService.processFile(file, { asociadoA: empleado })
      setProgress(80)
      if ((res as any).error){
        alert('Error al parsear: '+ (res as any).error)
        setProcessing(false)
        setProgress(0)
        return
      }
      setParsed(res)
      setProgress(100)
      // don't close yet; show preview and let user confirm
    }catch(e){
      console.error('Error procesando archivo', e)
      const s = String(e || '')
      alert('Error procesando archivo: ' + (s.length > 400 ? s.slice(0,400) + '... (truncado, ver consola)' : s))
    }finally{ setProcessing(false); setProgress(0) }
  }

  const handleSave = async () => {
    if (!parsed) return
    try{
      setProcessing(true)
      // log helpful debug info to console (file size, parsed structure summary)
      try{ console.debug('Saving recibo, file:', file?.name, 'size:', file?.size, 'parsed keys:', Object.keys(parsed || {})) }catch(_){}
      const saved = await sueldosService.saveParsedRecibo(parsed, file || undefined)
      onProcessed && onProcessed(saved)
      setParsed(null)
      onClose()
    }catch(e){
      console.error('Error guardando recibo', e)
      const s = String(e || '')
      alert('Error guardando: ' + (s.length > 400 ? s.slice(0,400) + '... (truncado, ver consola)' : s))
    }finally{ setProcessing(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v)=> !v && onClose()} title="Subir recibo">
      <div className="space-y-3">
        <div>
          <label className="text-xs">Archivo (PDF / JPG / PNG)</label>
          <input type="file" accept="application/pdf,image/*" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="text-xs">Asociar a empleado/cliente (opcional)</label>
          <Input value={empleado} onChange={(e)=> setEmpleado(e.target.value)} placeholder="Nombre o CUIT" />
        </div>
        {processing && <div>Procesando... {progress}%</div>}
        {parsed && (
          <div className="border p-2 bg-slate-50 dark:bg-slate-800 rounded">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Previsualización del recibo</div>
              <div className="text-xs text-slate-500">Tamaño aproximado: {JSON.stringify(parsed || {}).length} chars</div>
            </div>
            <div className="mt-2">
              {(() => {
                const txt = JSON.stringify(parsed, null, 2) || ''
                const limit = 2000
                const show = showFull || txt.length <= limit
                return (
                  <>
                    <pre className="p-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded max-h-64 overflow-auto text-xs">{show ? txt : txt.slice(0, limit) + '... (truncado)'}</pre>
                    {txt.length > limit && (
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" onClick={() => setShowFull(s => !s)}>{showFull ? 'Ocultar' : 'Mostrar completo'}</Button>
                        <Button variant="ghost" onClick={() => { navigator.clipboard?.writeText(txt); alert('JSON copiado al portapapeles') }}>Copiar JSON</Button>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={()=> setParsed(null)}>Editar / Cancelar</Button>
              <Button onClick={handleSave}>Confirmar y guardar</Button>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleProcess} disabled={processing || !!parsed}>Procesar</Button>
        </div>
      </div>
    </Dialog>
  )
}
