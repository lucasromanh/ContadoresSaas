import React from 'react'
import toast, { Toaster as HotToaster } from 'react-hot-toast'

export const toastSuccess = (msg: string) => toast.success(msg)
export const toastError = (msg: string) => toast.error(msg)

export const Toaster: React.FC = () => (
  <HotToaster
    position="top-right"
    toastOptions={{
      style: { background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.06)' },
      success: { style: { background: '#ecfdf5', color: '#064e3b' } },
      error: { style: { background: '#fef2f2', color: '#7f1d1d' } }
    }}
  />
)
