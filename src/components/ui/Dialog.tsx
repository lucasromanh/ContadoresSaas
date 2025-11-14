import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Dialog = ({ children, open, onOpenChange, title, description }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void; title?: string; description?: string }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{/* trigger must be provided by consumer */}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
  <DialogPrimitive.Content className="fixed left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 bg-slate-100 dark:bg-slate-900 p-6 rounded shadow-lg">
          {/* Use Radix Title/Description for accessibility */}
          {title ? (
            <DialogPrimitive.Title className="text-lg font-semibold mb-2">{title}</DialogPrimitive.Title>
          ) : (
            // provide an invisible title to satisfy a11y requirements
            <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
          )}

          {description ? (
            <DialogPrimitive.Description className="text-sm text-gray-600 mb-4">{description}</DialogPrimitive.Description>
          ) : (
            // invisible description to ensure aria-describedby is present
            <DialogPrimitive.Description className="sr-only">Dialog content</DialogPrimitive.Description>
          )}

          <div>{children}</div>
          <DialogPrimitive.Close className="absolute top-3 right-3">✕</DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
