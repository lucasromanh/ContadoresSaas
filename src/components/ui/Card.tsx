import React from 'react'

export const Card: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-sm p-4 text-slate-900 dark:text-slate-100">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  )
}
