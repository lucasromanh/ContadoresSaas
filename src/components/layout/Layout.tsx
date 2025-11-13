import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export const Layout: React.FC = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
