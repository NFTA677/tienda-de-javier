import { useEffect, useMemo, useState } from 'react'
import api, { mensajeError } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { ESTADOS, codigoPedido, fechaHora, soles } from '../../utils'

export default function AdminPedidos() {
  const aviso = useToast()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(null)

  useEffect(() => {
    api
      .get('/pedidos')
      .then((res) => setPedidos(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudieron cargar los pedidos'), 'error'))
      .finally(() => setCargando(false))
  }, [aviso])

  const conteo = useMemo(() => {
    const c = { todos: pedidos.length }
    Object.keys(ESTADOS).forEach((e) => (c[e] = pedidos.filter((p) => p.estado === e).length))
    return c
  }, [pedidos])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return pedidos.filter(
      (p) =>
        (filtro === 'todos' || p.estado === filtro) &&
        (!q ||
          codigoPedido(p.id).toLowerCase().includes(q) ||
          p.user?.nombre?.toLowerCase().includes(q) ||
          p.user?.email?.toLowerCase().includes(q))
    )
  }, [pedidos, filtro, busqueda])

  const cambiarEstado = async (p, estado) => {
    if (estado === 'cancelado' && !window.confirm(`¿Cancelar el pedido ${codigoPedido(p.id)}? Se devolverá el stock y ya no podrá modificarse.`)) return
    try {
      const res = await api.put(`/pedidos/${p.id}/estado`, { estado })
      setPedidos((prev) => prev.map((x) => (x.id === p.id ? res.data : x)))
      aviso(`Pedido ${codigoPedido(p.id)}: ${ESTADOS[estado].label}`)
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo cambiar el estado'), 'error')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>Pedidos</h1>
          <p className="muted">Pedidos de todos los clientes. Cambia el estado según avance cada envío.</p>
        </div>
      </header>

      <div className="chips">
        {['todos', ...Object.keys(ESTADOS)].map((e) => (
          <button key={e} className={`chip ${filtro === e ? 'activo' : ''}`} onClick={() => setFiltro(e)}>
            {e === 'todos' ? 'Todos' : ESTADOS[e].label} <span>{conteo[e]}</span>
          </button>
        ))}
      </div>

      <input
        className="input"
        placeholder="Buscar por código, cliente o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <div className="cargando">Cargando pedidos...</div>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const unidades = p.detalles.reduce((s, d) => s + d.cantidad, 0)
                const expandido = abierto === p.id
                return [
                  <tr key={p.id} className="fila-click" onClick={() => setAbierto(expandido ? null : p.id)}>
                    <td>
                      <b>{codigoPedido(p.id)}</b>
                      <small className="muted bloque">{fechaHora(p.createdAt)}</small>
                    </td>
                    <td>
                      {p.user?.nombre || <span className="muted">Usuario eliminado</span>}
                      <small className="muted bloque">{p.user?.email}</small>
                    </td>
                    <td>
                      {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
                      <small className="link-neon bloque">{expandido ? 'Ocultar detalle' : 'Ver detalle'}</small>
                    </td>
                    <td><b className="price">{soles(p.total)}</b></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={`input input-sm estado-select estado-${p.estado}`}
                        value={p.estado}
                        disabled={p.estado === 'cancelado'}
                        onChange={(e) => cambiarEstado(p, e.target.value)}
                        aria-label={`Estado del pedido ${codigoPedido(p.id)}`}
                      >
                        {Object.entries(ESTADOS).map(([k, e]) => <option key={k} value={k}>{e.label}</option>)}
                      </select>
                    </td>
                  </tr>,
                  expandido && (
                    <tr key={`${p.id}-detalle`} className="fila-detalle">
                      <td colSpan={5}>
                        <ul className="detalle-lista">
                          {p.detalles.map((d) => (
                            <li key={d.id}>
                              <span>{d.cantidad} × {d.producto?.nombre || 'Producto eliminado'}</span>
                              <span className="muted">{soles(d.precioUnitario)} c/u</span>
                              <b>{soles(d.precioUnitario * d.cantidad)}</b>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ),
                ]
              })}
              {!lista.length && (
                <tr><td colSpan={5} className="muted centro">No hay pedidos con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
