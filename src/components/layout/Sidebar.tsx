import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useUserStore } from '../../store/useUserStore'
import ProfileCard from '../ui/ProfileCard'
import alertasService from '../../pages/Alertas/services/alertasService'
import { listFacturas, emitter as facturasEmitter } from '../../modules/ocr/facturasService'

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
  const [unread, setUnread] = useState<number>(0)
  const [pulse, setPulse] = useState(false)
  const [facturasTotal, setFacturasTotal] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    try{
      const counts = alertasService.getCounts()
      if (mounted) setUnread(counts.pendientes + counts.urgentes)
    }catch(e){}

    const handler = (ev: any) => {
      try{
        const counts = alertasService.getCounts()
        if (mounted) setUnread(counts.pendientes + counts.urgentes)
        // trigger a short pulse animation on the badge
        try{ setPulse(true); setTimeout(()=>setPulse(false), 1200) }catch(e){}
        // play a subtle sound on new alert
        try{
          if (typeof window !== 'undefined' && 'AudioContext' in window){
            const ctx: any = new (window as any).AudioContext()
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            o.type = 'sine'
            o.frequency.setValueAtTime(880, ctx.currentTime)
            g.gain.setValueAtTime(0.0001, ctx.currentTime)
            o.connect(g); g.connect(ctx.destination)
            o.start()
            g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01)
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16)
            setTimeout(()=>{ o.stop(); try{ ctx.close() }catch(e){} }, 180)
          }
        }catch(e){}
      }catch(e){}
    }

    alertasService.emitter.addEventListener('new-alert', handler)
    // initialize facturas total
    try{
      const list = listFacturas()
      const total = (list || []).reduce((s:any,f:any)=> s + (Number(f.totales?.total || 0)), 0)
      if (mounted) setFacturasTotal(total)
    }catch(e){}

    const fHandler = (ev:any)=>{
      try{
        const payload = ev?.detail
        // recalc total
        const list = listFacturas()
        const total = (list || []).reduce((s:any,f:any)=> s + (Number(f.totales?.total || 0)), 0)
        if (mounted) setFacturasTotal(total)
      }catch(e){}
    }
    try{ facturasEmitter.addEventListener('saved', fHandler) }catch(e){}

    return () => {
      mounted = false
      try{ alertasService.emitter.removeEventListener('new-alert', handler) }catch(e){}
  try{ facturasEmitter.removeEventListener('saved', fHandler) }catch(e){}
    }
  }, [])

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
          <NavLink to="/alertas" className={({ isActive }) => cn('block p-2 rounded transition-colors text-sm', isActive ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}>
            <div className="flex items-center justify-between">
              <span>Alertas</span>
              {unread > 0 && <span className={cn('ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100', pulse ? 'animate-pulse' : '')}>{unread}</span>}
            </div>
          </NavLink>
          <div className="mt-2 px-2">
            <div className="text-xs text-slate-500">Facturas guardadas</div>
            <div className="text-sm font-semibold">Total: ${facturasTotal.toFixed(2)}</div>
          </div>
        </nav>
      </div>

      <div className="p-3 border-t dark:border-slate-700">
        <ProfileCard user={user} />
      </div>
    </aside>
  )
}

export default Sidebar
