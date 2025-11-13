import React from 'react'
import { Card } from '../../components/ui/Card'
import { RechartsChart } from '../../components/charts/RechartsChart'
import { TremorChart } from '../../components/charts/TremorChart'
import { useDashboard } from '../../hooks/useDashboard'

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card title={title}>
      <div className="text-2xl font-semibold">{value}</div>
    </Card>
  )
}

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) return <div>Cargando dashboard...</div>
  if (error) return <div>Error cargando dashboard</div>

  // data shape is backend dependent; render fallback placeholders if missing
  const ingresos = data?.ingresos ?? '$ 125.000'
  const costos = data?.costos ?? '$ 45.000'
  const margen = data?.margen ?? '$ 80.000'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Ingresos" value={ingresos} />
        <StatCard title="Costos" value={costos} />
        <StatCard title="Margen" value={margen} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Flujo de caja mensual">
          <RechartsChart />
        </Card>
        <TremorChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Ranking de clientes">{JSON.stringify(data?.ranking ?? 'sin datos')}</Card>
        <Card title="Estado anual">{JSON.stringify(data?.estado ?? 'sin datos')}</Card>
        <Card title="Alertas">{JSON.stringify(data?.alertas ?? 'sin datos')}</Card>
      </div>
    </div>
  )
}
