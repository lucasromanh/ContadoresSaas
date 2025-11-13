import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'

export const useProveedores = () => {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/proveedores')
        return data
      } catch (err) {
        console.warn('useProveedores: backend request failed, returning mock data', err)
        return [
          { id: 'p1', nombre: 'Proveedor Demo', percepciones: ['IVA'], retenciones: ['IIBB'] }
        ]
      }
    },
    retry: false
  })
}
