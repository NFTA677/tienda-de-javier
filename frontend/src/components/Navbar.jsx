import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { iniciales } from '../utils'

export function Marca() {
  return (
    <>
      hackeame<span>.pe</span>
    </>
  )
}

export default function Navbar() {
  const { user, esAdmin, logout } = useAuth()
  const { cantidadTotal } = useCart()
  const navigate = useNavigate()

  const salir = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo" aria-label="hackeame.pe, inicio">
        <Marca />
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        {user && <NavLink to="/pedidos">Mis pedidos</NavLink>}
        {esAdmin && <NavLink to="/admin" className="nav-admin">Panel admin</NavLink>}
      </nav>

      <div className="nav-right">
        <NavLink to="/carrito" className="cart-btn" aria-label="Carrito">
          Carrito
          {cantidadTotal > 0 && <span className="cart-count">{cantidadTotal}</span>}
        </NavLink>

        {user ? (
          <>
            <div className="user-chip" title={user.email}>
              <span className="avatar">{iniciales(user.nombre)}</span>
              <span className="user-name">{user.nombre}</span>
              {esAdmin && <span className="badge badge-neon">ADMIN</span>}
            </div>
            <button onClick={salir} className="btn-ghost">Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Entrar</Link>
            <Link to="/registro" className="btn-neon btn-sm">Crear cuenta</Link>
          </>
        )}
      </div>
    </header>
  )
}
