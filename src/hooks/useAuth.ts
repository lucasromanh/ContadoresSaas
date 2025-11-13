import { useQuery } from '@tanstack/react-query'
import { api } from '../services/axios'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile')
      return data
    },
    retry: false
  })
}
