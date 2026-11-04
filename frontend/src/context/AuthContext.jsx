import { createContext, useContext, useEffect, useState } from 'react'
import api, { TOKEN_KEY } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)))

  // Al abrir la página, recupera el usuario si hay un token guardado
  useEffect(() => {
    if (!sessionStorage.getItem(TOKEN_KEY)) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => sessionStorage.removeItem(TOKEN_KEY))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    const expirado = () => {
      sessionStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }
    window.addEventListener('auth:expirado', expirado)
    return () => window.removeEventListener('auth:expirado', expirado)
  }, [])

  const guardarSesion = ({ token, user }) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    setUser(user)
    return user
  }

  const login = async (email, password) => guardarSesion((await api.post('/auth/login', { email, password })).data)

  const registro = async (datos) => guardarSesion((await api.post('/auth/register', datos)).data)

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  const esAdmin = user?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ user, cargando, esAdmin, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
