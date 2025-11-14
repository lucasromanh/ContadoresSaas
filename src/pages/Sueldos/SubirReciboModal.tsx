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

  const handleProcess = async () => {
    if (!file) return alert('Sube un archivo primero')
    setProcessing(true)
    setProgress(10)
    try{
      const res = await sueldosService.processFile(file, { asociadoA: empleado })
      setProgress(100)
      onProcessed && onProcessed(res)
      onClose()
    }catch(e){
      alert('Error procesando archivo: '+ String(e))
    }finally{ setProcessing(false); setProgress(0) }
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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleProcess} disabled={processing}>Procesar y guardar</Button>
        </div>
      </div>
    </Dialog>
  )
}
