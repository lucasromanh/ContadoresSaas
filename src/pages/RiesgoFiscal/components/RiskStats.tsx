import React, { useMemo } from 'react'
import { AlertaFiscal } from '../services/riesgoService'
import { Card } from '../../../components/ui/Card'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#EF4444', '#F59E0B', '#0EA5E9', '#64748B']

export const RiskStats: React.FC<{ alertas: AlertaFiscal[] }> = ({ alertas }) => {
  const byTipo = useMemo(() => {
    const map: Record<string, number> = {}
    alertas.forEach((a) => { map[a.tipo] = (map[a.tipo] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [alertas])

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {}
    alertas.forEach((a) => {
      const d = new Date(a.fecha)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = (map[key] || 0) + 1
    })
    // convert to array and sort by date ascending
    const arr = Object.entries(map).map(([name, value]) => {
      const [y, m] = name.split('-')
      const date = new Date(Number(y), Number(m) - 1, 1)
      const label = date.toLocaleString(undefined, { month: 'short', year: 'numeric' })
      return { name, value, date, label }
    })
    arr.sort((a, b) => a.date.getTime() - b.date.getTime())
    return arr
  }, [alertas])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <div className="h-64">
          <h4 className="font-semibold mb-2">Distribución por tipo</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byTipo} dataKey="value" nameKey="name" outerRadius={70} fill="#8884d8">
                {byTipo.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="h-64">
          <h4 className="font-semibold mb-2">Alertas por mes</h4>
          <ResponsiveContainer width="100%" height={200}>
        <BarChart data={byMonth} margin={{ left: 0, right: 10 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: '#94A3B8' }} />
              <YAxis />
              <Tooltip />
              <Legend />
          <Bar dataKey="value" fill="#0EA5E9" barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="h-64">
          <h4 className="font-semibold mb-2">Resumen rápido</h4>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between"><span>Total alertas</span><strong>{alertas.length}</strong></div>
            <div className="flex justify-between"><span>Criticas</span><strong>{alertas.filter(a => a.criticidad === 'alta').length}</strong></div>
            <div className="flex justify-between"><span>En proceso</span><strong>{alertas.filter(a => a.estado === 'en_proceso').length}</strong></div>
            <div className="flex justify-between"><span>Resueltas</span><strong>{alertas.filter(a => a.estado === 'resuelta').length}</strong></div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RiskStats
