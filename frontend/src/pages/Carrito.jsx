import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { mensajeError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { iniciales, soles } from '../utils'

export default function Carrito() {
  const { user } = useAuth()
  const { items, cambiarCantidad, quitar, vaciar, total, cantidadTotal } = useCart()
  const aviso = useToast()
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)

  const confirmar = async () => {
    if (!user) return navigate('/login?next=/carrito')
    try {
      setEnviando(true)
      await api.post('/pedidos', {
        productos: items.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
      })
      vaciar()
      aviso('¡Pedido realizado con éxito!')
      navigate('/pedidos')
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo crear el pedido'), 'error')
    } finally {
      setEnviando(false)
    }
  }

  if (!items.length) {
    return (
      <div className="page vacio">
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos desde el catálogo.</p>
        <Link to="/productos" className="btn-neon">Ver productos</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">CARRITO <span>/{cantidadTotal}</span></h2>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((i) => (
            <div key={i.id} className="cart-item">
              <div className="cart-thumb">
                {i.imagen ? <img src={i.imagen} alt={i.nombre} /> : iniciales(i.nombre)}
              </div>
              <div className="cart-info">
                <h3>{i.nombre}</h3>
                <span className="muted">{soles(i.precio)} c/u · stock {i.stock}</span>
              </div>
              <div className="qty">
                <button onClick={() => cambiarCantidad(i.id, i.cantidad - 1)} disabled={i.cantidad <= 1} aria-label="Quitar uno">−</button>
                <span>{i.cantidad}</span>
                <button onClick={() => cambiarCantidad(i.id, i.cantidad + 1)} disabled={i.cantidad >= i.stock} aria-label="Agregar uno">+</button>
              </div>
              <b className="price">{soles(i.precio * i.cantidad)}</b>
              <button className="btn-icon" onClick={() => quitar(i.id)} aria-label={`Quitar ${i.nombre}`}>✕</button>
            </div>
          ))}
        </div>

        <aside className="cart-resumen">
          <h3>Resumen</h3>
          <div className="resumen-row"><span>Productos</span><span>{cantidadTotal}</span></div>
          <div className="resumen-row total"><span>Total</span><span className="price">{soles(total)}</span></div>
          <button className="btn-neon" onClick={confirmar} disabled={enviando}>
            {enviando ? 'Procesando...' : user ? 'Confirmar pedido' : 'Inicia sesión para comprar'}
          </button>
          <button className="btn-ghost" onClick={vaciar}>Vaciar carrito</button>
        </aside>
      </div>
    </div>
  )
}
