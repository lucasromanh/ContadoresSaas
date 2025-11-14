import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Dialog = ({ children, open, onOpenChange, title, description }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void; title?: string; description?: string }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{/* trigger must be provided by consumer */}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
        {/*
          Responsive content: fullscreen on small screens (mobile), centered modal on md+
        */}
        <DialogPrimitive.Content className="fixed left-0 top-0 w-full h-full bg-slate-100 dark:bg-slate-900 p-4 rounded-none shadow-lg md:left-1/2 md:top-1/2 md:w-full md:max-w-3xl md:h-auto md:-translate-x-1/2 md:-translate-y-1/2 md:rounded md:p-6">
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

          <div className="h-full">{children}</div>
          <DialogPrimitive.Close className="absolute top-3 right-3">✕</DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
