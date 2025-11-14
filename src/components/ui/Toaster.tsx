import React, { useEffect, useState } from 'react'
import { Dialog } from './Dialog'

type ToastEvent = { type: 'success' | 'error' | 'info'; title?: string; message: string }

// Public functions to trigger toasts (now dispatched as window events)
export const toastSuccess = (msg: string, title?: string) => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', title, message: msg } as ToastEvent }))
}
export const toastError = (msg: string, title?: string) => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', title, message: msg } as ToastEvent }))
}
export const toastInfo = (msg: string, title?: string) => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'info', title, message: msg } as ToastEvent }))
}

// The Toaster component listens for 'app-toast' events and shows a modal dialog
export const Toaster: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState<ToastEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastEvent
      setPayload(detail)
      setOpen(true)
      // auto-close after 3.5s
      setTimeout(() => setOpen(false), 3500)
    }
    window.addEventListener('app-toast', handler as EventListener)
    return () => window.removeEventListener('app-toast', handler as EventListener)
  }, [])

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)} title={payload?.title || (payload?.type === 'error' ? 'Error' : payload?.type === 'success' ? 'Éxito' : 'Aviso') }>
      <div className="p-2">
        <div className={`text-sm ${payload?.type === 'error' ? 'text-red-700' : payload?.type === 'success' ? 'text-emerald-700' : 'text-sky-700'}`}>{payload?.message}</div>
        <div className="mt-3 flex justify-end">
          <button className="text-xs text-slate-500 hover:underline" onClick={() => setOpen(false)}>Cerrar</button>
        </div>
      </div>
    </Dialog>
  )
}
