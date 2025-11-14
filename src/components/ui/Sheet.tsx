import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Sheet = ({ children, open, onOpenChange, title, description }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void; title?: string; description?: string }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
        <DialogPrimitive.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 p-6 shadow-xl overflow-auto">
          {title ? (
            <DialogPrimitive.Title className="text-lg font-semibold mb-4">{title}</DialogPrimitive.Title>
          ) : (
            <DialogPrimitive.Title className="sr-only">Sheet</DialogPrimitive.Title>
          )}

          {description ? (
            <DialogPrimitive.Description className="text-sm text-gray-600 mb-4">{description}</DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">Sheet content</DialogPrimitive.Description>
          )}

          <div>{children}</div>
          <DialogPrimitive.Close className="absolute top-3 right-3">✕</DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default Sheet
