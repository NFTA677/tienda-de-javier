import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mensajeError } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { ESTADOS, codigoPedido, fechaHora, soles } from '../../utils'

export default function Resumen() {
  const aviso = useToast()
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    api
      .get('/admin/resumen')
      .then((res) => setDatos(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudo cargar el resumen'), 'error'))
  }, [aviso])

  if (!datos) return <div className="cargando">Cargando resumen...</div>

  const totalPedidos = datos.pedidos || 1

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>Resumen</h1>
          <p className="muted">Cómo va la tienda hoy.</p>
        </div>
        <Link to="/admin/productos?nuevo=1" className="btn-neon">+ Nuevo producto</Link>
      </header>

      <div className="kpis">
        <div className="kpi kpi-neon"><span>Ventas</span><b>{soles(datos.ventas)}</b><small>Sin contar cancelados</small></div>
        <Link to="/admin/pedidos" className="kpi"><span>Pedidos</span><b>{datos.pedidos}</b><small>{datos.estados.pendiente} pendientes</small></Link>
        <Link to="/admin/productos" className="kpi"><span>Productos</span><b>{datos.productos}</b><small>{datos.stockBajo.length} con stock bajo</small></Link>
        <Link to="/admin/usuarios" className="kpi"><span>Usuarios</span><b>{datos.usuarios}</b><small>Cuentas registradas</small></Link>
      </div>

      <div className="admin-cols">
        <div className="panel">
          <div className="panel-head">
            <h2>Pedidos recientes</h2>
            <Link to="/admin/pedidos" className="link-neon">Ver todos →</Link>
          </div>
          {datos.recientes.length ? (
            <ul className="lista">
              {datos.recientes.map((p) => (
                <li key={p.id}>
                  <div>
                    <b>{codigoPedido(p.id)}</b> <span className="muted">· {p.user?.nombre || 'Usuario eliminado'}</span>
                    <small className="muted bloque">{fechaHora(p.createdAt)}</small>
                  </div>
                  <div className="lista-der">
                    <span className={`badge ${ESTADOS[p.estado]?.clase}`}>{ESTADOS[p.estado]?.label}</span>
                    <b>{soles(p.total)}</b>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted panel-vacio">Todavía no hay pedidos.</p>
          )}
        </div>

        <div className="admin-stack">
          <div className="panel">
            <div className="panel-head"><h2>Pedidos por estado</h2></div>
            <div className="barras">
              {Object.entries(ESTADOS).map(([clave, e]) => (
                <div key={clave} className="barra-fila">
                  <span>{e.label}</span>
                  <div className="barra"><i className={e.clase} style={{ width: `${(datos.estados[clave] / totalPedidos) * 100}%` }} /></div>
                  <b>{datos.estados[clave]}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>Stock bajo</h2><span className="muted">≤ 5 unidades</span></div>
            {datos.stockBajo.length ? (
              <ul className="lista">
                {datos.stockBajo.map((p) => (
                  <li key={p.id}>
                    <span>{p.nombre}</span>
                    <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} u.`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted panel-vacio">Todo el catálogo tiene stock suficiente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
