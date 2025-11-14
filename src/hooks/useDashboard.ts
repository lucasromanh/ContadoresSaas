import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'
import { useAppStore } from '../store/useAppStore'
import dashboardService from '../services/dashboardService'

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const backendOnline = useAppStore.getState().backendOnline
      const mock = {
        ingresos: '$ 125.000',
        costos: '$ 45.000',
        margen: '$ 80.000',
        ranking: [{ name: 'Cliente A', value: '$ 10.000' }],
        estado: { año: 2025, saldo: '$ 1.200.000' },
        alertas: ['AFIP vencido', 'Documento faltante'],
        proximos: dashboardService.getProximos()
      }

      if (!backendOnline) {
        // Avoid calling the API when we already know backend is down
        return mock
      }

      try {
        const { data } = await api.get('/dashboard')
        return data
      } catch (err) {
        console.warn('useDashboard: backend request failed, returning mock data', err)
        // Mark backend offline so subsequent hooks skip real requests
        useAppStore.setState({ backendOnline: false })
        return mock
      }
    },
    retry: false
  })
}
