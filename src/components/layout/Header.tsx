import React from 'react'
import { useUserStore } from '../../store/useUserStore'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Dialog } from '../ui/Dialog'
import SidebarContent from './SidebarContent'

export const Header: React.FC = () => {
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)
  // Theme toggle available via ThemeToggle component

  const [open, setOpen] = React.useState(false)

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b dark:border-slate-700">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <svg className="w-5 h-5 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="text-lg font-semibold text-primary">Cont(iA)dor</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">{user ? user.name : 'Invitado'}</div>
          <ThemeToggle />
          {user && (
            <button className="text-sm text-slate-600" onClick={() => logout()}>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile sidebar dialog */}
      <Dialog open={open} onOpenChange={(v) => setOpen(v)} title="Navegación">
        <div className="h-full">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </Dialog>
    </header>
  )
}

export default Header
