import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { iniciales, soles } from '../utils'

export default function ProductCard({ producto: p, onEditar, onEliminar }) {
  const { esAdmin } = useAuth()
  const { items, agregar } = useCart()
  const aviso = useToast()
  const [imagenRota, setImagenRota] = useState(false)

  const enCarrito = items.find((i) => i.id === p.id)?.cantidad || 0
  const agotado = p.stock <= 0
  const sinMas = enCarrito >= p.stock

  const agregarAlCarrito = () => {
    agregar(p)
    aviso(`"${p.nombre}" agregado al carrito`)
  }

  return (
    <article className="product-card">
      <div className="product-img">
        {p.imagen && !imagenRota ? (
          <img src={p.imagen} alt={p.nombre} loading="lazy" onError={() => setImagenRota(true)} />
        ) : (
          <span>{iniciales(p.nombre)}</span>
        )}
        {agotado && <span className="badge badge-red product-flag">AGOTADO</span>}
      </div>
      <h3>{p.nombre}</h3>
      <p className="product-desc">{p.descripcion || 'Sin descripción'}</p>
      <div className="price-row">
        <span className="price">{soles(p.precio)}</span>
        <span className="stock">Stock {p.stock}</span>
      </div>

      <button className="btn-white" onClick={agregarAlCarrito} disabled={agotado || sinMas}>
        {agotado ? 'Agotado' : sinMas ? 'Máximo en carrito' : enCarrito ? `Agregar otro (${enCarrito})` : 'Agregar'}
      </button>

      {esAdmin && (
        <div className="admin-actions">
          <button className="btn-ghost" onClick={() => onEditar(p)}>Editar</button>
          <button className="btn-ghost btn-danger" onClick={() => onEliminar(p)}>Eliminar</button>
        </div>
      )}
    </article>
  )
}
