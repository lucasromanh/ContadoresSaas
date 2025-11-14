import React from 'react'
import { Card } from '../../components/ui/Card'
import { RechartsChart } from '../../components/charts/RechartsChart'
import { TremorChart } from '../../components/charts/TremorChart'
import { useDashboard } from '../../hooks/useDashboard'
import { useAppStore } from '../../store/useAppStore'

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="flex items-center justify-between" title={title}>
      <div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </Card>
  )
}

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useDashboard()
  const isBackendOnline = useAppStore((s) => s.backendOnline)

  if (isLoading) return <div>Cargando dashboard...</div>
  if (error) return <div>Error cargando dashboard</div>

  // data shape is backend dependent; render fallback placeholders if missing
  const ingresos = data?.ingresos ?? '$ 125.000'
  const costos = data?.costos ?? '$ 45.000'
  const margen = data?.margen ?? '$ 80.000'
  const ranking = data?.ranking ?? []
  const estado = data?.estado ?? null
  const alertas = data?.alertas ?? []

  return (
    <div className="space-y-6">
      {!isBackendOnline && (
        <div className="p-3 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-700">
          Backend no disponible — mostrando datos de ejemplo (mock)
        </div>
      )}
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
        <Card title="Ranking de clientes">
          {ranking.length === 0 ? (
            <div className="text-sm text-slate-500">Sin datos</div>
          ) : (
            <ul className="space-y-2">
              {ranking.map((r: any, i: number) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="font-medium">{r.name ?? r.nombre ?? 'Cliente'}</div>
                  <div className="text-sm text-slate-600">{r.value ?? r.monto ?? '-'}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Estado anual">
          {estado ? (
            <div className="space-y-1 text-sm">
              <div>Año: <span className="font-medium">{estado.año ?? estado.year ?? '-'}</span></div>
              <div>Saldo: <span className="font-medium">{estado.saldo ?? estado.balance ?? '-'}</span></div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Sin datos</div>
          )}
        </Card>

        <Card title="Alertas">
          {alertas.length === 0 ? (
            <div className="text-sm text-slate-500">Sin alertas</div>
          ) : (
            <ul className="space-y-2">
              {alertas.map((a: any, i: number) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-300">• {a}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
