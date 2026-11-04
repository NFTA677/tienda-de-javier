import { Fragment, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { mensajeError } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Icon from '../../components/Icon'
import { ESTADOS, codigoPedido, fechaHora, iniciales, soles } from '../../utils'

// Descarga los pedidos filtrados como CSV (se abre en Excel)
const exportarCSV = (pedidos) => {
  const filas = [['Pedido', 'Fecha', 'Cliente', 'Email', 'Productos', 'Unidades', 'Total', 'Estado']]
  pedidos.forEach((p) =>
    filas.push([
      codigoPedido(p.id),
      new Date(p.createdAt).toLocaleString('es-PE'),
      p.user?.nombre || 'Usuario eliminado',
      p.user?.email || '',
      p.detalles.map((d) => `${d.cantidad}x ${d.producto?.nombre || 'Producto eliminado'}`).join(' | '),
      p.detalles.reduce((s, d) => s + d.cantidad, 0),
      p.total.toFixed(2),
      ESTADOS[p.estado]?.label || p.estado,
    ])
  )
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `pedidos-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

function Miniaturas({ detalles }) {
  const visibles = detalles.slice(0, 3)
  const resto = detalles.length - visibles.length
  return (
    <div className="thumbs">
      {visibles.map((d) => (
        <span key={d.id} className="thumb" title={d.producto?.nombre}>
          {d.producto?.imagen ? <img src={d.producto.imagen} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
          {iniciales(d.producto?.nombre || '?')}
        </span>
      ))}
      {resto > 0 && <span className="thumb thumb-mas">+{resto}</span>}
    </div>
  )
}

export default function AdminPedidos() {
  const aviso = useToast()
  const { recargarContadores } = useOutletContext()
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

  const kpis = useMemo(() => {
    const validos = pedidos.filter((p) => p.estado !== 'cancelado')
    const ingresos = validos.reduce((s, p) => s + p.total, 0)
    return {
      ingresos,
      porAtender: conteo.pendiente + conteo.pagado,
      promedio: validos.length ? ingresos / validos.length : 0,
    }
  }, [pedidos, conteo])

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
      recargarContadores()
      aviso(`Pedido ${codigoPedido(p.id)} → ${ESTADOS[estado].label}`)
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo cambiar el estado'), 'error')
    }
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Pedidos</h1>
          <p>Pedidos de todos los clientes. Actualiza el estado a medida que avanza cada envío.</p>
        </div>
        <button className="btn-outline" onClick={() => exportarCSV(lista)} disabled={!lista.length}>
          <Icon nombre="descargar" size={16} /> Exportar a Excel
        </button>
      </header>

      <div className="adm-kpis">
        <div className="adm-kpi">
          <span className="adm-kpi-ico"><Icon nombre="pedidos" /></span>
          <div><small>Pedidos</small><b>{pedidos.length}</b></div>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-ico ico-amber"><Icon nombre="reloj" /></span>
          <div><small>Por atender</small><b>{kpis.porAtender}</b></div>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-ico ico-neon"><Icon nombre="dinero" /></span>
          <div><small>Ingresos</small><b>{soles(kpis.ingresos)}</b></div>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-ico ico-blue"><Icon nombre="ticket" /></span>
          <div><small>Ticket promedio</small><b>{soles(kpis.promedio)}</b></div>
        </div>
      </div>

      <section className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="tablist">
            {['todos', ...Object.keys(ESTADOS)].map((e) => (
              <button key={e} role="tab" aria-selected={filtro === e} className={filtro === e ? 'activo' : ''} onClick={() => setFiltro(e)}>
                {e !== 'todos' && <i className={`dot dot-${e}`} />}
                {e === 'todos' ? 'Todos' : ESTADOS[e].label}
                <span>{conteo[e]}</span>
              </button>
            ))}
          </div>
          <label className="search">
            <Icon nombre="buscar" size={16} />
            <input placeholder="Buscar código, cliente o email" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>
        </div>

        {cargando ? (
          <div className="cargando">Cargando pedidos...</div>
        ) : lista.length ? (
          <div className="tabla-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th className="der">Total</th>
                  <th>Estado</th>
                  <th aria-label="Detalle" />
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => {
                  const unidades = p.detalles.reduce((s, d) => s + d.cantidad, 0)
                  const expandido = abierto === p.id
                  return (
                    <Fragment key={p.id}>
                      <tr className={`fila ${expandido ? 'abierta' : ''}`} onClick={() => setAbierto(expandido ? null : p.id)}>
                        <td>
                          <b className="mono">{codigoPedido(p.id)}</b>
                          <small>{fechaHora(p.createdAt)}</small>
                        </td>
                        <td>
                          <div className="persona">
                            <span className="avatar">{iniciales(p.user?.nombre || '?')}</span>
                            <div>
                              <b>{p.user?.nombre || 'Usuario eliminado'}</b>
                              <small>{p.user?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="persona">
                            <Miniaturas detalles={p.detalles} />
                            <small>{unidades} {unidades === 1 ? 'unidad' : 'unidades'}</small>
                          </div>
                        </td>
                        <td className="der"><b className="monto">{soles(p.total)}</b></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <label className={`pill-select pill-${p.estado}`}>
                            <i className={`dot dot-${p.estado}`} />
                            <select
                              value={p.estado}
                              disabled={p.estado === 'cancelado'}
                              onChange={(e) => cambiarEstado(p, e.target.value)}
                              aria-label={`Estado del pedido ${codigoPedido(p.id)}`}
                            >
                              {Object.entries(ESTADOS).map(([k, e]) => <option key={k} value={k}>{e.label}</option>)}
                            </select>
                            {p.estado !== 'cancelado' && <Icon nombre="abajo" size={14} />}
                          </label>
                        </td>
                        <td className="der">
                          <span className={`chevron ${expandido ? 'girado' : ''}`}><Icon nombre="abajo" size={16} /></span>
                        </td>
                      </tr>
                      {expandido && (
                        <tr className="fila-detalle">
                          <td colSpan={6}>
                            <div className="detalle">
                              <div className="detalle-items">
                                {p.detalles.map((d) => (
                                  <div key={d.id} className="detalle-item">
                                    <span className="thumb thumb-lg">
                                      {d.producto?.imagen ? <img src={d.producto.imagen} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                                      {iniciales(d.producto?.nombre || '?')}
                                    </span>
                                    <div className="detalle-nombre">
                                      <b>{d.producto?.nombre || 'Producto eliminado'}</b>
                                      <small>{d.cantidad} × {soles(d.precioUnitario)}</small>
                                    </div>
                                    <b>{soles(d.precioUnitario * d.cantidad)}</b>
                                  </div>
                                ))}
                              </div>
                              <aside className="detalle-resumen">
                                <div><span>Cliente</span><b>{p.user?.nombre || '—'}</b></div>
                                <div><span>Fecha</span><b>{new Date(p.createdAt).toLocaleString('es-PE')}</b></div>
                                <div><span>Unidades</span><b>{unidades}</b></div>
                                <div className="total"><span>Total</span><b>{soles(p.total)}</b></div>
                              </aside>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="adm-empty">
            <Icon nombre="pedidos" size={28} />
            <b>{pedidos.length ? 'No hay pedidos con estos filtros' : 'Todavía no hay pedidos'}</b>
            <span>{pedidos.length ? 'Prueba con otro estado o búsqueda.' : 'Cuando un cliente compre, aparecerá aquí.'}</span>
          </div>
        )}
      </section>
    </div>
  )
}
