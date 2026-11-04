import { Link, Navigate, useLocation } from 'react-router-dom'
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
        <Link to="/" className="btn-neon">Volver a la tienda</Link>
      </div>
    )
  }
  return children
}
