import React from 'react'
import { NavLink } from 'react-router-dom'

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/clientes', label: 'Clientes' },
    { to: '/proveedores', label: 'Proveedores' },
    { to: '/sueldos', label: 'Sueldos' },
    { to: '/iibb', label: 'IIBB' },
    { to: '/riesgo-fiscal', label: 'Riesgo Fiscal' },
    { to: '/libros-iva', label: 'Libros IVA' },
    { to: '/vencimientos', label: 'Vencimientos' }
  ]

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-700 min-h-screen">
      <div className="p-4 font-bold text-primary">ContadorPro</div>
      <nav className="p-2">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `block p-2 rounded hover:bg-slate-100 ${isActive ? 'bg-slate-100 font-semibold' : ''}`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
