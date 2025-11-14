import React from 'react'
import { Card } from '../../../components/ui/Card'

export const RiskCard: React.FC<{ icon: React.ReactNode; title: string; color?: string; count: number; onClick?: () => void }> = ({ icon, title, color = 'slate', count, onClick }) => {
  const colorClass = color === 'red' ? 'ring-red-400' : color === 'yellow' ? 'ring-amber-400' : color === 'blue' ? 'ring-sky-400' : 'ring-slate-400'
  return (
    <div onClick={onClick} role="button" tabIndex={0} className={`cursor-pointer`}>
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-md bg-slate-100 dark:bg-slate-800 ${colorClass}`}>{icon}</div>
            <div>
              <div className="text-sm text-slate-500">{title}</div>
              <div className="text-xl font-semibold">{count}</div>
            </div>
          </div>
          <div>
            <button className="text-sm text-primary">Ver detalles</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RiskCard
