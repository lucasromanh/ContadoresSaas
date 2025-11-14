import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export const Layout: React.FC = () => {
  return (
    // Stack on small screens, two-column on md+
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
