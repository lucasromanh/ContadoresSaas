import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (v: boolean) => void
  title?: string
  description?: string
  side?: 'left' | 'right'
}

export const Sheet: React.FC<SheetProps> = ({ 
  children, 
  open, 
  onOpenChange, 
  title, 
  description,
  side = 'left'
}) => {
  const sideClasses = side === 'left' 
    ? 'left-0 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0' 
    : 'right-0 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0'

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/60 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content 
          className={`fixed top-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl z-50 transition-transform duration-300 ease-in-out overflow-auto ${sideClasses}`}
        >
          {title ? (
            <div className="relative p-4 border-b dark:border-slate-700">
              <DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Close className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              <DialogPrimitive.Title className="sr-only">Menú de navegación</DialogPrimitive.Title>
              <DialogPrimitive.Close className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </DialogPrimitive.Close>
            </>
          )}

          {description ? (
            <DialogPrimitive.Description className="text-sm text-slate-600 dark:text-slate-400 px-4 py-2">{description}</DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">Sheet content</DialogPrimitive.Description>
          )}

          <div>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default Sheet
