import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import { soles } from '../utils'
import hero from '../assets/hero.png'

export default function Inicio() {
  const { user, esAdmin } = useAuth()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api
      .get('/productos')
      .then((res) => setProductos(res.data))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [])

  const conStock = productos.filter((p) => p.stock > 0)
  const novedades = conStock.slice(0, 4)
  const ofertas = [...conStock].sort((a, b) => a.precio - b.precio).slice(0, 4)

  const categorias = useMemo(() => {
    const c = {}
    productos.forEach((p) => {
      const k = p.categoria || 'General'
      c[k] = c[k] || { nombre: k, cantidad: 0, desde: Infinity }
      c[k].cantidad++
      c[k].desde = Math.min(c[k].desde, p.precio)
    })
    return Object.values(c).sort((a, b) => b.cantidad - a.cantidad)
  }, [productos])

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">{user ? `Hola, ${user.nombre.split(' ')[0]}` : 'Bienvenido a hackeame.pe'}</span>
          <h1>
            Todo lo que buscas,<br />
            <span>en un solo lugar.</span>
          </h1>
          <p>Explora el catálogo, arma tu carrito y sigue tus pedidos desde tu cuenta.</p>
          <div className="hero-actions">
            <Link to="/productos" className="btn-neon">Ver productos</Link>
            {!user && <Link to="/registro" className="btn-ghost btn-lg">Crear cuenta</Link>}
            {user && !esAdmin && <Link to="/pedidos" className="btn-ghost btn-lg">Mis pedidos</Link>}
            {esAdmin && <Link to="/admin" className="btn-ghost btn-lg">Ir al panel admin</Link>}
          </div>
        </div>
        <img src={hero} alt="" className="hero-art" />
      </section>

      <section className="stats">
        <div className="stat"><b>{cargando ? '—' : productos.length}</b><span>Productos</span></div>
        <div className="stat"><b>{cargando ? '—' : categorias.length}</b><span>Categorías</span></div>
        <div className="stat"><b>{cargando ? '—' : conStock.length}</b><span>Disponibles ya</span></div>
      </section>

      {categorias.length > 0 && (
        <section>
          <div className="section-head"><h2>CATEGORÍAS</h2></div>
          <div className="cat-grid">
            {categorias.map((c) => (
              <Link key={c.nombre} to={`/productos?categoria=${encodeURIComponent(c.nombre)}`} className="cat-card">
                <b>{c.nombre}</b>
                <span className="muted">{c.cantidad} {c.cantidad === 1 ? 'producto' : 'productos'} · desde {soles(c.desde)}</span>
                <span className="cat-flecha" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>NOVEDADES</h2>
          <Link to="/productos" className="link-neon">Ver todo →</Link>
        </div>
        {cargando ? (
          <div className="cargando">Cargando productos...</div>
        ) : novedades.length ? (
          <div className="grid">
            {novedades.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        ) : (
          <div className="vacio">
            <p>Aún no hay productos disponibles.</p>
            {esAdmin && <Link to="/admin/productos?nuevo=1" className="btn-neon">Crear producto</Link>}
          </div>
        )}
      </section>

      {ofertas.length > 1 && (
        <section>
          <div className="section-head">
            <h2>MEJORES PRECIOS</h2>
            <Link to="/productos" className="link-neon">Ver todo →</Link>
          </div>
          <div className="grid">
            {ofertas.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        </section>
      )}

      <section>
        <div className="section-head"><h2>CÓMO COMPRAR</h2></div>
        <div className="pasos">
          <div className="paso"><i>1</i><h3>Crea tu cuenta</h3><p>Regístrate gratis con tu email.</p></div>
          <div className="paso"><i>2</i><h3>Arma tu carrito</h3><p>Elige productos y cantidades.</p></div>
          <div className="paso"><i>3</i><h3>Confirma el pedido</h3><p>Lo registramos al instante.</p></div>
          <div className="paso"><i>4</i><h3>Sigue el estado</h3><p>Pendiente, pagado, enviado y entregado.</p></div>
        </div>
      </section>

      <section className="features">
        <div className="feature"><h3>Catálogo al día</h3><p>Precios y stock actualizados en tiempo real.</p></div>
        <div className="feature"><h3>Cuenta segura</h3><p>Contraseñas cifradas y acceso con token JWT.</p></div>
        <div className="feature"><h3>Seguimiento</h3><p>Revisa el estado de cada pedido desde tu cuenta.</p></div>
      </section>
    </div>
  )
}
