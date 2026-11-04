import axios from 'axios'

export const TOKEN_KEY = 'fulstak_token'

const api = axios.create({
  // En producción el frontend y la API están en el mismo dominio, bajo /api
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'),
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token venció o no es válido, cerramos la sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && sessionStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('auth:expirado'))
    }
    return Promise.reject(error)
  }
)

export const mensajeError = (e, porDefecto = 'Ocurrió un error') =>
  e.response?.data?.error || e.response?.data?.msg || porDefecto

export default api
