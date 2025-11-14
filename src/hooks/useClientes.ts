import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'
import { useAppStore } from '../store/useAppStore'

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const backendOnline = useAppStore.getState().backendOnline
      const mock = [
        { id: '1', nombre: 'Cliente Demo', deudas: '$ 15.000', ultimosPagos: '10/2025 — $ 5.000', mensajes: '2 mensajes' }
      ]

      if (!backendOnline) return mock

      try {
        const { data } = await api.get('/clientes')
        return data
      } catch (err) {
        console.warn('useClientes: backend request failed, returning mock data', err)
        useAppStore.setState({ backendOnline: false })
        return mock
      }
    },
    retry: false
  })
}
