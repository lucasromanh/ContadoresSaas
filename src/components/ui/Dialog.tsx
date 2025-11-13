import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Dialog = ({ children, open, onOpenChange, title }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void; title?: string }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{/* trigger must be provided by consumer */}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 p-6 rounded shadow-lg">
          {title && <div className="text-lg font-semibold mb-2">{title}</div>}
          <div>{children}</div>
          <DialogPrimitive.Close className="absolute top-3 right-3">✕</DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
