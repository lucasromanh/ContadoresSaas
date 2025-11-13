import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

// Example interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centralizado: podrías manejar auth expirado, logging, etc.
    return Promise.reject(err)
  }
)

export default api
