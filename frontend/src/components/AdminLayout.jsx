import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { iniciales } from '../utils'
import { Marca } from './Navbar'
import Icon from './Icon'

const secciones = [
  { to: '/admin', label: 'Resumen', icono: 'resumen', end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icono: 'pedidos', contador: 'porAtender' },
  { to: '/admin/productos', label: 'Productos', icono: 'productos', contador: 'stockBajo' },
  { to: '/admin/usuarios', label: 'Usuarios', icono: 'usuarios' },
]

// Panel de administración: menú lateral propio, separado de la tienda
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [contadores, setContadores] = useState({})

  const recargarContadores = useCallback(() => {
    api
      .get('/admin/resumen')
      .then(({ data }) =>
        setContadores({
          porAtender: data.estados.pendiente + data.estados.pagado,
          stockBajo: data.stockBajo.length,
        })
      )
      .catch(() => {})
  }, [])

  useEffect(recargarContadores, [recargarContadores, pathname])

  const actual = secciones.find((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to)))

  const salir = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link to="/admin" className="adm-brand">
          <span className="logo"><Marca /></span>
          <span className="adm-tag">Admin</span>
        </Link>

        <nav className="adm-nav">
          <span className="adm-nav-title">Gestión</span>
          {secciones.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.end}>
              <Icon nombre={s.icono} />
              <span>{s.label}</span>
              {s.contador && contadores[s.contador] > 0 && (
                <em className={s.contador === 'stockBajo' ? 'warn' : ''}>{contadores[s.contador]}</em>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="adm-side-foot">
          <Link to="/" className="adm-store-link">
            <Icon nombre="tienda" />
            <span>Ver tienda</span>
            <Icon nombre="externo" size={14} className="adm-ext" />
          </Link>
          <div className="adm-user">
            <span className="avatar">{iniciales(user.nombre)}</span>
            <div>
              <b>{user.nombre}</b>
              <small>{user.email}</small>
            </div>
            <button onClick={salir} className="adm-logout" aria-label="Cerrar sesión" title="Cerrar sesión">
              <Icon nombre="salir" />
            </button>
          </div>
        </div>
      </aside>

      <div className="adm-body">
        <header className="adm-top">
          <div className="adm-crumbs">
            <span>Panel</span>
            <span className="sep">/</span>
            <b>{actual?.label || 'Resumen'}</b>
          </div>
          <span className="muted adm-fecha">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>
        <main className="adm-content">
          <Outlet context={{ recargarContadores }} />
        </main>
      </div>
    </div>
  )
}
