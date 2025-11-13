import React from 'react'
import { useUserStore } from '../../store/useUserStore'
import { ThemeToggle } from '../ui/ThemeToggle'

export const Header: React.FC = () => {
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)
  // Theme toggle available via ThemeToggle component

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b dark:border-slate-700">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        <div className="text-lg font-semibold text-primary">ContadorPro</div>
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
    </header>
  )
}

export default Header
