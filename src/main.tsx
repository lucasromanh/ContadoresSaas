import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { Toaster } from './components/ui'
import { ThemeProvider } from './context/ThemeProvider'
import { useAppStore } from './store/useAppStore'

const queryClient = new QueryClient()

// Small startup probe: if backend is reachable we'll flip backendOnline to true and
// invalidate queries so components refetch real data. We default the store to
// `backendOnline: false` to avoid multiple failing requests when backend is down.
async function checkBackendAndMaybeEnable() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  try {
    // A lightweight probe — some backends may not respond to `/` but if it works
    // we consider the backend available.
    const res = await fetch(baseURL, { method: 'GET', signal: controller.signal })
    if (res.ok) {
      useAppStore.setState({ backendOnline: true })
      // If we just discovered the backend, let TanStack Query refetch real data
      queryClient.invalidateQueries()
    } else {
      // Non-OK doesn't necessarily mean offline; keep offline=false to be safe
      useAppStore.setState({ backendOnline: false })
    }
  } catch (e) {
    // network error or timeout -> mark as offline
    useAppStore.setState({ backendOnline: false })
    // avoid noisy stack traces in production console; keep a simple message
    console.warn('Backend no disponible, usando datos mock (probe failed).')
  } finally {
    clearTimeout(timeout)
  }
}

// Run probe but don't block initial render — UI will show mock data until probe finishes.
checkBackendAndMaybeEnable()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
