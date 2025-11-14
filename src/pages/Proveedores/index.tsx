import React from 'react'
import { Card } from '../../components/ui/Card'
import { useProveedores } from '../../hooks/useProveedores'

export const ProveedoresPage: React.FC = () => {
  const { data, isLoading, error } = useProveedores()

  if (isLoading) return <div>Cargando proveedores...</div>
  if (error) return <div>Error cargando proveedores</div>

  const proveedores = data ?? []

  return (
    <div className="space-y-4">
      <Card title="Proveedores - Retenciones y Percepciones">
        {proveedores.length === 0 ? (
          <div className="text-sm text-slate-500">No hay proveedores</div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {proveedores.map((p: any) => (
              <li key={p.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{p.nombre ?? 'Proveedor'}</div>
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  <div>Percepciones: {Array.isArray(p.percepciones) ? p.percepciones.join(', ') : String(p.percepciones ?? '-')}</div>
                  <div>Retenciones: {Array.isArray(p.retenciones) ? p.retenciones.join(', ') : String(p.retenciones ?? '-')}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
