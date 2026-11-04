import { useEffect, useMemo, useState } from 'react'
import api, { mensajeError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { fecha, iniciales, soles } from '../utils'

export default function Usuarios() {
  const { user: yo } = useAuth()
  const aviso = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')

  useEffect(() => {
    api
      .get('/usuarios')
      .then((res) => setUsuarios(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudieron cargar los usuarios'), 'error'))
      .finally(() => setCargando(false))
  }, [aviso])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return usuarios.filter(
      (u) =>
        (filtroRol === 'todos' || u.rol === filtroRol) &&
        (u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    )
  }, [usuarios, busqueda, filtroRol])

  const admins = usuarios.filter((u) => u.rol === 'admin').length

  const cambiarRol = async (u, rol) => {
    try {
      await api.put(`/usuarios/${u.id}/rol`, { rol })
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, rol } : x)))
      aviso(`${u.nombre} ahora es ${rol}`)
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo cambiar el rol'), 'error')
    }
  }

  const eliminar = async (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre} (${u.email}) y sus pedidos?`)) return
    try {
      await api.delete(`/usuarios/${u.id}`)
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
      aviso('Usuario eliminado')
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo eliminar'), 'error')
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">USUARIOS <span>/{usuarios.length}</span></h2>

      <section className="stats">
        <div className="stat"><b>{usuarios.length}</b><span>Cuentas</span></div>
        <div className="stat"><b>{admins}</b><span>Administradores</span></div>
        <div className="stat"><b>{usuarios.length - admins}</b><span>Clientes</span></div>
      </section>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="input" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          <option value="todos">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="cliente">Clientes</option>
        </select>
      </div>

      {cargando ? (
        <div className="cargando">Cargando usuarios...</div>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Pedidos</th>
                <th>Gastado</th>
                <th>Registro</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => {
                const soyYo = u.id === yo.id
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <span className="avatar">{iniciales(u.nombre)}</span>
                        <div>
                          <b>{u.nombre} {soyYo && <span className="muted">(tú)</span>}</b>
                          <span className="muted">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="input input-sm"
                        value={u.rol}
                        disabled={soyYo}
                        onChange={(e) => cambiarRol(u, e.target.value)}
                        aria-label={`Rol de ${u.nombre}`}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{u.pedidos}</td>
                    <td>{soles(u.gastado)}</td>
                    <td className="muted">{fecha(u.createdAt)}</td>
                    <td>
                      <button className="btn-ghost btn-danger" disabled={soyYo} onClick={() => eliminar(u)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!lista.length && (
                <tr>
                  <td colSpan={6} className="muted centro">Ningún usuario coincide.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
