import React from 'react'
import SidebarContent from './SidebarContent'

export const Sidebar: React.FC = () => {
  // show only on md+ screens; mobile handled by Header menu
  return (
    <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-700 min-h-screen flex-col">
      <SidebarContent />
    </aside>
  )
}

export default Sidebar
