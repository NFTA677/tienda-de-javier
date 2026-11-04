import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mensajeError } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Icon from '../../components/Icon'
import { ESTADOS, codigoPedido, fechaHora, iniciales, soles } from '../../utils'

export default function Resumen() {
  const { user } = useAuth()
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
  const porAtender = datos.estados.pendiente + datos.estados.pagado

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Hola, {user.nombre.split(' ')[0]}</h1>
          <p>Este es el estado de tu tienda hoy.</p>
        </div>
        <Link to="/admin/productos?nuevo=1" className="btn-neon"><Icon nombre="mas" size={16} /> Nuevo producto</Link>
      </header>

      <div className="adm-kpis">
        <div className="adm-kpi kpi-destacado">
          <span className="adm-kpi-ico ico-neon"><Icon nombre="dinero" /></span>
          <div><small>Ventas</small><b>{soles(datos.ventas)}</b><em>Sin contar cancelados</em></div>
        </div>
        <Link to="/admin/pedidos" className="adm-kpi">
          <span className="adm-kpi-ico ico-amber"><Icon nombre="pedidos" /></span>
          <div><small>Pedidos</small><b>{datos.pedidos}</b><em>{porAtender} por atender</em></div>
        </Link>
        <Link to="/admin/productos" className="adm-kpi">
          <span className="adm-kpi-ico ico-blue"><Icon nombre="productos" /></span>
          <div><small>Productos</small><b>{datos.productos}</b><em>{datos.stockBajo.length} con stock bajo</em></div>
        </Link>
        <Link to="/admin/usuarios" className="adm-kpi">
          <span className="adm-kpi-ico"><Icon nombre="usuarios" /></span>
          <div><small>Usuarios</small><b>{datos.usuarios}</b><em>Cuentas registradas</em></div>
        </Link>
      </div>

      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>Pedidos recientes</h2>
            <Link to="/admin/pedidos" className="link-neon">Ver todos</Link>
          </div>
          {datos.recientes.length ? (
            <ul className="adm-list">
              {datos.recientes.map((p) => (
                <li key={p.id}>
                  <div className="persona">
                    <span className="avatar">{iniciales(p.user?.nombre || '?')}</span>
                    <div>
                      <b>{p.user?.nombre || 'Usuario eliminado'}</b>
                      <small><span className="mono">{codigoPedido(p.id)}</span> · {fechaHora(p.createdAt)}</small>
                    </div>
                  </div>
                  <div className="adm-list-der">
                    <span className={`estado estado-${p.estado}`}><i className={`dot dot-${p.estado}`} />{ESTADOS[p.estado]?.label}</span>
                    <b className="monto">{soles(p.total)}</b>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="adm-empty"><Icon nombre="pedidos" size={28} /><b>Todavía no hay pedidos</b></div>
          )}
        </section>

        <div className="adm-stack">
          <section className="adm-card">
            <div className="adm-card-head"><h2>Pedidos por estado</h2></div>
            <div className="barras">
              {Object.entries(ESTADOS).map(([clave, e]) => (
                <div key={clave} className="barra-fila">
                  <span><i className={`dot dot-${clave}`} />{e.label}</span>
                  <div className="barra"><i className={`fill-${clave}`} style={{ width: `${(datos.estados[clave] / totalPedidos) * 100}%` }} /></div>
                  <b>{datos.estados[clave]}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Stock bajo</h2>
              <small className="muted">5 unidades o menos</small>
            </div>
            {datos.stockBajo.length ? (
              <ul className="adm-list compacta">
                {datos.stockBajo.map((p) => (
                  <li key={p.id}>
                    <span className="persona">
                      <span className="thumb">
                        {p.imagen ? <img src={p.imagen} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                        {iniciales(p.nombre)}
                      </span>
                      <b>{p.nombre}</b>
                    </span>
                    <span className={`estado ${p.stock === 0 ? 'estado-cancelado' : 'estado-pendiente'}`}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} u.`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="adm-empty"><Icon nombre="productos" size={28} /><b>Todo tiene stock suficiente</b></div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
