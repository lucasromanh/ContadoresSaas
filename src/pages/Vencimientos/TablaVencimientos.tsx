import React, { useMemo, useState } from 'react'
import { Vencimiento } from './services/vencimientosService'
import { Button } from '../../components/ui/Button'

export default function TablaVencimientos({ items, onViewDetail, onMark }: { items: Vencimiento[]; onViewDetail?: (v:Vencimiento)=>void; onMark?: (id:string, estado: Vencimiento['estado'])=>void }){
  const [page, setPage] = useState(0)
  const pageSize = 10

  const sorted = useMemo(()=>{
    const copy = [...items]
    copy.sort((a,b)=> new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    return copy
  },[items])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageData = sorted.slice(page*pageSize, (page+1)*pageSize)

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-2 py-1 text-left">Fecha</th>
            <th className="px-2 py-1 text-left">Tipo</th>
            <th className="px-2 py-1 text-left">Cliente</th>
            <th className="px-2 py-1 text-left">Organismo</th>
            <th className="px-2 py-1 text-left">Provincia</th>
            <th className="px-2 py-1 text-left">Estado</th>
            <th className="px-2 py-1 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((r)=> {
            const estadoClass = r.estado === 'vencido' ? 'bg-red-50 dark:bg-red-900/30' : r.estado === 'pagado' ? 'bg-emerald-50 dark:bg-emerald-900/20' : r.estado === 'presentado' ? 'bg-slate-100 dark:bg-slate-800' : ''
            const criticClass = r.criticidad==='alta'?'bg-red-50 dark:bg-red-900/30': r.criticidad==='media'?'bg-amber-50 dark:bg-amber-900/20':''
            return (
              <tr key={r.id} className={`border-t ${estadoClass} ${criticClass}`}>
                <td className="px-2 py-1">{r.fecha}</td>
                <td className="px-2 py-1">{r.tipo}</td>
                <td className="px-2 py-1">{r.cliente} <div className="text-xs text-slate-500">{r.cuit}</div></td>
                <td className="px-2 py-1">{r.organismo}</td>
                <td className="px-2 py-1">{r.provincia}</td>
                <td className="px-2 py-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${r.estado==='vencido' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : r.estado==='pagado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' : r.estado==='presentado' ? 'bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-100' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>{r.estado}</span>
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={()=> onViewDetail && onViewDetail(r)}>Ver</Button>
                    <Button size="sm" variant="outline" onClick={()=> onMark && onMark(r.id, 'presentado')}>Marcar presentado</Button>
                    <Button size="sm" variant="ghost" onClick={()=> onMark && onMark(r.id, 'pagado')}>Marcar pagado</Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-slate-500">Página {page+1} de {pageCount}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={()=> setPage(p=>Math.max(0,p-1))} disabled={page===0}>Anterior</Button>
          <Button size="sm" variant="ghost" onClick={()=> setPage(p=>Math.min(pageCount-1,p+1))} disabled={page>=pageCount-1}>Siguiente</Button>
        </div>
      </div>
    </div>
  )
}
