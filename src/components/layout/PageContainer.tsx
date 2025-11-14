import React from 'react'
import { cn } from '../../lib/utils'

export const PageContainer: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full', className)}>{children}</div>
}

export default PageContainer
