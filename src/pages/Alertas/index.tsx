import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { alertService } from '../../services/alertService'

export const AlertasPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    alertService.getAlerts().then((a) => setAlerts(a))
  }, [])

  return (
    <div className="space-y-4">
      <Card title="Alertas automáticas">
        {alerts.length === 0 ? (
          <div className="text-sm text-slate-500">Sin alertas</div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((al) => (
              <li key={al.id} className="flex items-center justify-between">
                <div>{al.text}</div>
                <div>
                  <button className="text-sm text-green-600 mr-2" onClick={() => alertService.markReviewed(al.id).then(() => setAlerts((s) => s.filter((x) => x.id !== al.id)))}>
                    Marcar revisado
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default AlertasPage
