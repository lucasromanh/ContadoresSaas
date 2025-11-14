import axios from 'axios'
import { useAppStore } from '../store/useAppStore'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor para detectar problemas de red y marcar el backend como offline
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Si no hay respuesta (network error en navegador), marcamos backend como offline
    if (!err.response) {
      try {
        // Usamos la API estática de zustand para actualizar el estado fuera de React
        useAppStore.setState({ backendOnline: false })
      } catch (e) {
        // noop
      }
    }
    return Promise.reject(err)
  }
)

export default api
