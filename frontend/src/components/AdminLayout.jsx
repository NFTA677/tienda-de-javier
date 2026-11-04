import { NavLink, Outlet } from 'react-router-dom'

const secciones = [
  { to: '/admin', label: 'Resumen', icono: '◧', end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icono: '▤' },
  { to: '/admin/productos', label: 'Productos', icono: '▦' },
  { to: '/admin/usuarios', label: 'Usuarios', icono: '◉' },
]

// Estructura del panel de administración: menú lateral + contenido
export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin-side">
        <span className="admin-side-title">Panel admin</span>
        <nav>
          {secciones.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.end}>
              <span className="admin-icono" aria-hidden="true">{s.icono}</span>
              {s.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="admin-main">
        <Outlet />
      </section>
    </div>
  )
}
