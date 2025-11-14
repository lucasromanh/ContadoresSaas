import React from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'

export default function ResultadoOCRModal({ open, onClose, text }:{ open:boolean; onClose:()=>void; text?:string }){
  if (!open) return null
  return (
    <Dialog open={open} onOpenChange={(v)=> !v && onClose()} title="Resultado OCR">
      <div>
        <div className="text-sm text-slate-500">Texto extraído (vista previa)</div>
        <pre className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded max-h-64 overflow-auto text-xs">{text || 'Sin resultado'}</pre>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Dialog>
  )
}
