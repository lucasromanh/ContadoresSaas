import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useUserStore } from '../../store/useUserStore'
import ProfileCard from '../ui/ProfileCard'
import alertasService from '../../pages/Alertas/services/alertasService'

export default function SidebarContent({ onNavigate }: { onNavigate?: ()=>void }){
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
  const [unread, setUnread] = React.useState<number>(0)
  const [pulse, setPulse] = React.useState(false)

  React.useEffect(()=>{
    let mounted = true
    try{ const counts = alertasService.getCounts(); if (mounted) setUnread(counts.pendientes + counts.urgentes) }catch(e){}
    const handler = ()=>{
      try{ const counts = alertasService.getCounts(); if (mounted) setUnread(counts.pendientes + counts.urgentes); try{ setPulse(true); setTimeout(()=>setPulse(false), 1200) }catch(e){} }catch(e){}
    }
    alertasService.emitter.addEventListener('new-alert', handler)
    return ()=>{ mounted = false; try{ alertasService.emitter.removeEventListener('new-alert', handler) }catch(e){} }
  },[])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 font-bold text-primary">Cont(iA)dor</div>

      <div className="px-2 flex-1 overflow-auto">
        <nav className="py-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={()=> onNavigate && onNavigate()}
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
          <NavLink to="/alertas" onClick={()=> onNavigate && onNavigate()} className={({ isActive }) => cn('block p-2 rounded transition-colors text-sm', isActive ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}>
            <div className="flex items-center justify-between">
              <span>Alertas</span>
              {unread > 0 && <span className={cn('ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100', pulse ? 'animate-pulse' : '')}>{unread}</span>}
            </div>
          </NavLink>
        </nav>
      </div>

      <div className="p-3 border-t dark:border-slate-700">
        <ProfileCard user={user} />
      </div>
    </div>
  )
}
