import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/clientes')
        return data
      } catch (err) {
        console.warn('useClientes: backend request failed, returning mock data', err)
        return [
          { id: '1', nombre: 'Cliente Demo', deudas: '$ 15.000', ultimosPagos: '10/2025 — $ 5.000', mensajes: '2 mensajes' }
        ]
      }
    },
    retry: false
  })
}
