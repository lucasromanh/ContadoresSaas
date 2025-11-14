import React, { useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { AlertaFiscal } from '../services/riesgoService'

export const RiskSummary: React.FC<{ alertas: AlertaFiscal[] }> = ({ alertas }) => {
  const stats = useMemo(() => {
    const total = alertas.length
    const criticas = alertas.filter((a) => a.criticidad === 'alta').length
    const resueltas = alertas.filter((a) => a.estado === 'resuelta').length
    const nuevas = alertas.filter((a) => {
      const d = new Date(a.fecha)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { total, criticas, resueltas, nuevas }
  }, [alertas])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <div className="text-sm text-slate-500">Total alertas (mes)</div>
        <div className="text-2xl font-bold">{stats.total}</div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">Alertas críticas</div>
        <div className="text-2xl font-bold text-red-500">{stats.criticas}</div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">Alertas resueltas</div>
        <div className="text-2xl font-bold text-green-500">{stats.resueltas}</div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">Alertas nuevas</div>
        <div className="text-2xl font-bold">{stats.nuevas}</div>
      </Card>
    </div>
  )
}

export default RiskSummary
