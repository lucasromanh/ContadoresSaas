import React from 'react'
import SmartTable from '../../components/ui/SmartTable'
import { SueldoSummary } from '../../types/reciboSueldo'

export default function TablaSueldos({ data, onAction }:{ data: SueldoSummary[]; onAction?: (a:string,row:any)=>void }){
  return (
    <div>
      <SmartTable columns={[{ key: 'id', label: 'ID' }, { key: 'empleado', label: 'Empleado' }, { key: 'periodoMes', label: 'Periodo' }, { key: 'neto', label: 'Neto' }]} data={data as any} onAction={(a,r)=> onAction && onAction(a,r)} searchKeys={['empleado']} />
    </div>
  )
}
