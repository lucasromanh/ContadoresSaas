import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useUserStore } from '../../store/useUserStore'
import ProfileCard from '../ui/ProfileCard'

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

  const user = useUserStore((s) => s.user)

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-700 min-h-screen flex flex-col">
      <div className="p-4 font-bold text-primary">ContadorPro</div>

      <div className="px-2 flex-1 overflow-auto">
        <nav className="py-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'block p-2 rounded transition-colors text-sm',
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t dark:border-slate-700">
        <ProfileCard user={user} />
      </div>
    </aside>
  )
}

export default Sidebar
