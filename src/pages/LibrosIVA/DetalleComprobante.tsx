import React from 'react'
import ivaService from './services/ivaService'

export default function DetalleComprobante({ item, onClose, onMarked }: { item: any | null, onClose: ()=>void, onMarked?: (id:string)=>void }){
  if (!item) return null
  async function mark() {
    if (item.id) {
      ivaService.markReviewed(item.id)
      if (onMarked) onMarked(item.id)
    }
  }

  return (
    <div className="fixed right-4 top-12 w-96 h-[80vh] bg-white border rounded shadow-lg p-4 overflow-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Detalle {item.puntoVenta}-{item.numero}</h3>
        <button onClick={onClose} className="text-sm text-neutral-500">Cerrar</button>
      </div>
      <div className="text-sm space-y-2">
        <div><strong>Fecha:</strong> {item.fecha}</div>
        <div><strong>Tipo:</strong> {item.tipo}</div>
        <div><strong>CUIT:</strong> {item.cuit}</div>
        <div><strong>Razon:</strong> {item.razonSocial}</div>
        <div><strong>Neto:</strong> ${item.neto}</div>
        <div><strong>IVA21:</strong> ${item.iva21}</div>
        <div><strong>Total:</strong> ${item.total}</div>
        {item.cae && <div><strong>CAE:</strong> {item.cae} (vto: {item.caeVencimiento})</div>}
        {item.inconsistencias && <div><strong>Inconsistencias:</strong> {item.inconsistencias.join(', ')}</div>}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={mark} className="btn-primary px-3 py-1">Marcar Revisado</button>
        <a className="px-3 py-1 border rounded" href="#" onClick={(e)=>{ e.preventDefault(); const csv = ivaService.exportCSV([item]); csv.then((c)=>{ const blob = new Blob([c], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `comprobante_${item.id}.csv`; a.click(); }) }}>Exportar CSV</a>
      </div>
    </div>
  )
}
