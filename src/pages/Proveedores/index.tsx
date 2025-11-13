import React from 'react'
import { Card } from '../../components/ui/Card'
import { useProveedores } from '../../hooks/useProveedores'

export const ProveedoresPage: React.FC = () => {
  const { data, isLoading, error } = useProveedores()

  if (isLoading) return <div>Cargando proveedores...</div>
  if (error) return <div>Error cargando proveedores</div>

  return (
    <div className="space-y-4">
      <Card title="Proveedores - Retenciones y Percepciones">
        <div className="text-sm">{JSON.stringify(data ?? 'sin datos')}</div>
      </Card>
    </div>
  )
}
