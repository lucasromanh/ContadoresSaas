import React from 'react'

export default function OCRResultModal({open, onClose, parsed, onSave}:{
  open:boolean,
  onClose:()=>void,
  parsed:any,
  onSave?: (p:any)=>void
}){
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg max-w-3xl w-full p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Resultado OCR - Previsualización</h3>
          <button className="px-2 py-1" onClick={onClose}>Cerrar</button>
        </div>
        <div className="mt-4 max-h-80 overflow-auto text-sm font-mono bg-slate-50 p-3 rounded">
          <pre>{JSON.stringify(parsed, null, 2)}</pre>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Cancelar</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>onSave && onSave(parsed)}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
