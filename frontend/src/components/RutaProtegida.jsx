import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Exige sesión iniciada (y rol admin si soloAdmin)
export default function RutaProtegida({ soloAdmin = false, children }) {
  const { user, cargando, esAdmin } = useAuth()
  const location = useLocation()

  if (cargando) return <div className="cargando">Cargando...</div>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (soloAdmin && !esAdmin) {
    return (
      <div className="page vacio">
        <h2>Acceso restringido</h2>
        <p>Esta sección es solo para administradores.</p>
      </div>
    )
  }
  return children
}
