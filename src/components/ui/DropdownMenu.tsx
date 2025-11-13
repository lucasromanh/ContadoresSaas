import React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

export const DropdownMenu: React.FC<{ children: React.ReactNode; trigger: React.ReactNode }> = ({ children, trigger }) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content className="bg-white dark:bg-slate-900 border rounded shadow py-1">
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
  <button {...props} className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}>
    {children}
  </button>
)
