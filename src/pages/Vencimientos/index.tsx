import React from 'react'
import { Card } from '../../components/ui/Card'

export const VencimientosPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card title="Vencimientos unificados">
        <div className="text-sm">AFIP + RENTAS + Municipales. Filtro por CUIT y envío de alertas por WhatsApp (simulado)</div>
      </Card>
    </div>
  )
}
