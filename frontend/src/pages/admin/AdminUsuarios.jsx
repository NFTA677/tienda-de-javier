import { useEffect, useMemo, useState } from 'react'
import api, { mensajeError } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Icon from '../../components/Icon'
import { fecha, iniciales, soles } from '../../utils'

export default function AdminUsuarios() {
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

  const conteo = useMemo(() => {
    const admin = usuarios.filter((u) => u.rol === 'admin').length
    return { todos: usuarios.length, admin, cliente: usuarios.length - admin }
  }, [usuarios])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return usuarios.filter(
      (u) =>
        (filtroRol === 'todos' || u.rol === filtroRol) &&
        (u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    )
  }, [usuarios, busqueda, filtroRol])

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
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona las cuentas y quién tiene permisos de administrador.</p>
        </div>
      </header>

      <section className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="tablist">
            {[['todos', 'Todos'], ['cliente', 'Clientes'], ['admin', 'Administradores']].map(([k, label]) => (
              <button key={k} role="tab" aria-selected={filtroRol === k} className={filtroRol === k ? 'activo' : ''} onClick={() => setFiltroRol(k)}>
                {label}
                <span>{conteo[k]}</span>
              </button>
            ))}
          </div>
          <label className="search">
            <Icon nombre="buscar" size={16} />
            <input placeholder="Buscar nombre o email" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>
        </div>

        {cargando ? (
          <div className="cargando">Cargando usuarios...</div>
        ) : lista.length ? (
          <div className="tabla-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th className="der">Pedidos</th>
                  <th className="der">Gastado</th>
                  <th>Registro</th>
                  <th className="der">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => {
                  const soyYo = u.id === yo.id
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="persona">
                          <span className={`avatar ${u.rol === 'admin' ? 'avatar-admin' : ''}`}>{iniciales(u.nombre)}</span>
                          <div>
                            <b>{u.nombre} {soyYo && <span className="tag">Tú</span>}</b>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <label className={`pill-select ${u.rol === 'admin' ? 'pill-pagado' : 'pill-neutro'}`}>
                          <select
                            value={u.rol}
                            disabled={soyYo}
                            onChange={(e) => cambiarRol(u, e.target.value)}
                            aria-label={`Rol de ${u.nombre}`}
                          >
                            <option value="cliente">Cliente</option>
                            <option value="admin">Admin</option>
                          </select>
                          {!soyYo && <Icon nombre="abajo" size={14} />}
                        </label>
                      </td>
                      <td className="der">{u.pedidos}</td>
                      <td className="der"><b className="monto">{soles(u.gastado)}</b></td>
                      <td><small>{fecha(u.createdAt)}</small></td>
                      <td className="der">
                        <button
                          className="icon-btn peligro"
                          disabled={soyYo}
                          onClick={() => eliminar(u)}
                          aria-label={`Eliminar a ${u.nombre}`}
                          title={soyYo ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                        >
                          <Icon nombre="borrar" size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="adm-empty"><Icon nombre="usuarios" size={28} /><b>Ningún usuario coincide</b></div>
        )}
      </section>
    </div>
  )
}
