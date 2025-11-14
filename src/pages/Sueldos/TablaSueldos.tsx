import React from 'react'
import SmartTable from '../../components/ui/SmartTable'
import { SueldoSummary } from '../../types/reciboSueldo'

// Accept either full ReciboSueldo objects or precomputed summaries and normalize to summary rows
export default function TablaSueldos({ data, onAction }:{ data: any[]; onAction?: (a:string,row:any)=>void }){
  const rows = (data || []).map((r:any) => {
    if (!r) return r
    // if already a summary
    if (r.empleado && typeof r.empleado === 'string' && r.id) return r as SueldoSummary
    // otherwise map from ReciboSueldo-like object
    return {
      id: r.id,
      empleado: r.empleado ? `${r.empleado.nombre} ${r.empleado.apellido || ''}`.trim() : (r.empleado || '-') ,
      cuil: r.empleado?.cuil || r.cuil,
      periodoMes: r.periodo?.mes || '-',
      periodoAño: r.periodo?.año || (r.fecha ? new Date(r.fecha).getFullYear() : new Date().getFullYear()),
      totalHaberes: r.totales?.totalHaberes ?? r.bruto ?? 0,
      totalDeducciones: r.totales?.totalDeducciones ?? 0,
      neto: r.totales?.neto ?? r.neto ?? 0,
      fechaCarga: r.fechaCarga || r.fecha
    } as SueldoSummary
  })

  return (
    <div>
      <SmartTable columns={[{ key: 'id', label: 'ID' }, { key: 'empleado', label: 'Empleado' }, { key: 'periodoMes', label: 'Periodo' }, { key: 'neto', label: 'Neto' }]} data={rows as any} onAction={(a,r)=> onAction && onAction(a,r)} searchKeys={['empleado']} />
    </div>
  )
}
