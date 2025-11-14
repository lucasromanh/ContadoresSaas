import React from 'react'
import { cn } from '../../lib/utils'

export const Card: React.FC<{ title?: string; children?: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => {
  return (
    <div className={cn('w-full break-inside-fix bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 text-slate-900 dark:text-slate-100', className)}>
      {title && <div className="font-semibold mb-3 text-slate-800 dark:text-slate-200">{title}</div>}
      <div>{children}</div>
    </div>
  )
}

export default Card
