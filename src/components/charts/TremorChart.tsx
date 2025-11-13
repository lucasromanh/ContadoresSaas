import React from 'react'
import { Card } from '../ui/Card'
import { AreaChart } from '@tremor/react'

export const TremorChart: React.FC = () => {
  // Tremor components require their own setup; we use a minimal placeholder
  return (
    <Card title="Flujo de caja mensual">
      <div className="h-44 flex items-center justify-center text-sm text-slate-500">Tremor chart placeholder</div>
    </Card>
  )
}
