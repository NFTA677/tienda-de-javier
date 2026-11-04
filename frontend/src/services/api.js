import axios from 'axios'

const api = axios.create({
  // En producción el frontend y la API están en el mismo dominio
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : ''),
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('fulstak_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api