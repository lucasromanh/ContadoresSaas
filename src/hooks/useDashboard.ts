import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/dashboard')
        return data
      } catch (err) {
        // Backend not available — return mock data so UI remains usable in dev
        console.warn('useDashboard: backend request failed, returning mock data', err)
        return {
          ingresos: '$ 125.000',
          costos: '$ 45.000',
          margen: '$ 80.000',
          ranking: [{ name: 'Cliente A', value: '$ 10.000' }],
          estado: { año: 2025, saldo: '$ 1.200.000' },
          alertas: ['AFIP vencido', 'Documento faltante']
        }
      }
    },
    retry: false
  })
}
