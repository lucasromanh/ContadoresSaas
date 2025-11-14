import React, { useEffect, useState } from 'react'
import UploadIVA from './UploadIVA'
import TablaIVA from './TablaIVA'
import ivaService from './services/ivaService'
import ResumenIVA from './ResumenIVA'
import FiltrosIVA from './FiltrosIVA'
import DetalleComprobante from './DetalleComprobante'

export default function LibrosIVAPage() {
  const [data, setData] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[] | null>(null)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    // load mock data initially
    ivaService.loadMock().then((d) => setData(d))
  }, [])

  function onProcessed(items: any[]) {
    setData((prev)=>[...items, ...prev])
  }

  function applyFilters(f: any) {
    if (!f || Object.keys(f).length===0) { setFiltered(null); return }
    const out = data.filter((d)=>{
      if (f.mes) { const m = new Date(d.fecha).getMonth()+1; if (Number(f.mes)!==m) return false }
      if (f.year) { const y = new Date(d.fecha).getFullYear(); if (Number(f.year)!==y) return false }
      if (f.cuit) if (!d.cuit.includes(f.cuit)) return false
      if (f.tipo) if (d.tipo!==f.tipo) return false
      return true
    })
    setFiltered(out)
  }

  function handleRowClick(r: any) { setSelected(r) }

  function handleMark(id: string) {
    setData((prev)=> prev.map(p => p.id===id ? {...p, revisado: true} : p))
    if (selected && selected.id===id) setSelected({...selected, revisado: true})
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Libros IVA</h2>
      <div className="grid grid-cols-1 gap-4">
        <UploadIVA onProcessed={onProcessed} />
        <div>
          <ResumenIVA data={data} />
        </div>
        <div className="mt-4">
          <FiltrosIVA onApply={applyFilters} />
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Comprobantes</h3>
          <TablaIVA data={filtered ?? data} onRowClick={handleRowClick} />
        </div>
      </div>

      {selected && <DetalleComprobante item={selected} onClose={()=>setSelected(null)} onMarked={handleMark} />}
    </div>
  )
}

