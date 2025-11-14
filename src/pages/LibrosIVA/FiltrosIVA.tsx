import React, { useState } from 'react'

type Filters = { mes?: number; year?: number; cuit?: string; tipo?: string }

export default function FiltrosIVA({ onApply }: { onApply: (f: Filters) => void }) {
  const [mes, setMes] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [cuit, setCuit] = useState<string>('')
  const [tipo, setTipo] = useState<string>('')

  function apply() {
    const f: Filters = {}
    if (mes) f.mes = Number(mes)
    if (year) f.year = Number(year)
    if (cuit) f.cuit = cuit
    if (tipo) f.tipo = tipo
    onApply(f)
  }

  return (
    <div className="flex gap-3 items-end">
      <div>
        <label className="text-xs">Mes</label>
        <input type="number" value={mes} onChange={(e)=>setMes(e.target.value)} className="block border px-2 py-1 rounded" placeholder="MM" />
      </div>
      <div>
        <label className="text-xs">Año</label>
        <input type="number" value={year} onChange={(e)=>setYear(e.target.value)} className="block border px-2 py-1 rounded" placeholder="YYYY" />
      </div>
      <div>
        <label className="text-xs">CUIT</label>
        <input value={cuit} onChange={(e)=>setCuit(e.target.value)} className="block border px-2 py-1 rounded" placeholder="20-..." />
      </div>
      <div>
        <label className="text-xs">Tipo</label>
        <select value={tipo} onChange={(e)=>setTipo(e.target.value)} className="block border px-2 py-1 rounded">
          <option value="">Todos</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
      <div>
        <button onClick={apply} className="btn-primary px-3 py-1">Aplicar</button>
      </div>
    </div>
  )
}
