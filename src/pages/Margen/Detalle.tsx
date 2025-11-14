import React from 'react'
import { Link } from 'react-router-dom'

const MargenDetallePage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Detalle de Margen</h1>
      <p className="mt-2 text-sm text-gray-600">Vista placeholder para detalle de margen.</p>
      <div className="mt-4">
        <Link to="/" className="text-blue-600">Volver al dashboard</Link>
      </div>
    </div>
  )
}

export default MargenDetallePage
