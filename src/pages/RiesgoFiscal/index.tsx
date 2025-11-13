import React from 'react'
import { Card } from '../../components/ui/Card'

const categories = [
  { key: 'no_documenta', title: 'No envía documentación', color: 'bg-yellow-100' },
  { key: 'deuda_afip', title: 'Tiene deuda AFIP', color: 'bg-red-100' },
  { key: 'proy_multa', title: 'Proyección de multa', color: 'bg-orange-100' },
  { key: 'cambio_categoria', title: 'Pasa de categoría en 45 días', color: 'bg-blue-100' }
]

export const RiesgoFiscalPage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {categories.map((c) => (
        <Card key={c.key} title={c.title}>
          <ul className="text-sm space-y-1">
            <li>CUIT: 20-12345678-9 — Cliente X</li>
            <li>CUIT: 30-98765432-1 — Cliente Y</li>
          </ul>
        </Card>
      ))}
    </div>
  )
}
