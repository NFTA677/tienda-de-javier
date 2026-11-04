import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mensajeError } from '../services/api'
import { useToast } from '../context/ToastContext'
import { fecha, soles } from '../utils'

const colorEstado = { pendiente: 'badge-amber', pagado: 'badge-neon', enviado: 'badge-blue' }

export default function MisPedidos() {
  const aviso = useToast()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api
      .get('/pedidos/mios')
      .then((res) => setPedidos(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudieron cargar tus pedidos'), 'error'))
      .finally(() => setCargando(false))
  }, [aviso])

  if (cargando) return <div className="cargando">Cargando pedidos...</div>

  if (!pedidos.length) {
    return (
      <div className="page vacio">
        <h2>Aún no tienes pedidos</h2>
        <p>Cuando compres algo, aparecerá aquí.</p>
        <Link to="/productos" className="btn-neon">Ir a comprar</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">MIS PEDIDOS <span>/{pedidos.length}</span></h2>
      <div className="pedidos">
        {pedidos.map((p) => (
          <article key={p.id} className="pedido">
            <header>
              <div>
                <b>Pedido #{p.id.slice(-6).toUpperCase()}</b>
                <span className="muted"> · {fecha(p.createdAt)}</span>
              </div>
              <span className={`badge ${colorEstado[p.estado] || ''}`}>{p.estado.toUpperCase()}</span>
            </header>
            <ul>
              {p.detalles.map((d) => (
                <li key={d.id}>
                  <span>{d.cantidad} × {d.producto?.nombre || 'Producto eliminado'}</span>
                  <span>{soles(d.precioUnitario * d.cantidad)}</span>
                </li>
              ))}
            </ul>
            <footer>
              <span>Total</span>
              <b className="price">{soles(p.total)}</b>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}
