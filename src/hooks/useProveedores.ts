import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'
import { useAppStore } from '../store/useAppStore'

export const useProveedores = () => {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const backendOnline = useAppStore.getState().backendOnline
      const mock = [
        { id: 'p1', nombre: 'Proveedor Demo', percepciones: ['IVA'], retenciones: ['IIBB'] }
      ]

      if (!backendOnline) return mock

      try {
        const { data } = await api.get('/proveedores')
        return data
      } catch (err) {
        console.warn('useProveedores: backend request failed, returning mock data', err)
        useAppStore.setState({ backendOnline: false })
        return mock
      }
    },
    retry: false
  })
}
