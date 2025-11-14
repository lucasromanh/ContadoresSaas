import React, { useState } from 'react'
import { ocrFile } from './ocrService'
import OCRResultModal from './OCRResultModal'
import { toastSuccess } from '../../components/ui'
import { saveFactura } from './facturasService'

export default function OCRUploader(){
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [open, setOpen] = useState(false)

  async function handleFile(f: File | null){
    if (!f) return
    setFile(f)
    setLoading(true)
    try{
      const res = await ocrFile(f)
      // attempt a quick parse using existing FacturaParser if available
      let parsed:any = res
      try{ const parser = await import('./FacturaParser'); parsed = parser.parseFacturaFromOCR(res) }catch(e){ /* ignore */ }
      setResult(parsed)
      setOpen(true)
    }catch(e:any){
      console.error('OCR error', e)
      setResult({ error: String(e) })
      setOpen(true)
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <label className="block mb-2">Subir factura / ticket</label>
      <input type="file" accept="image/*,application/pdf" onChange={e=>handleFile(e.target.files?.[0]||null)} />
      {loading && <div className="text-sm text-gray-500">Procesando...</div>}
  <OCRResultModal open={open} onClose={()=>setOpen(false)} parsed={result} onSave={(p)=>{ saveFactura(p); setOpen(false); toastSuccess('Guardado') }} />
    </div>
  )
}
