import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
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

  const destacados = productos.filter((p) => p.stock > 0).slice(0, 4)
  const disponibles = productos.filter((p) => p.stock > 0).length

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">{user ? `Hola, ${user.nombre.split(' ')[0]}` : 'Bienvenido'}</span>
          <h1>
            Todo lo que buscas,<br />
            <span>en un solo lugar.</span>
          </h1>
          <p>Explora el catálogo, arma tu carrito y sigue tus pedidos desde tu cuenta.</p>
          <div className="hero-actions">
            <Link to="/productos" className="btn-neon">Ver productos</Link>
            {!user && <Link to="/registro" className="btn-ghost btn-lg">Crear cuenta</Link>}
            {user && <Link to="/pedidos" className="btn-ghost btn-lg">Mis pedidos</Link>}
          </div>
        </div>
        <img src={hero} alt="" className="hero-art" />
      </section>

      <section className="stats">
        <div className="stat"><b>{cargando ? '—' : productos.length}</b><span>Productos</span></div>
        <div className="stat"><b>{cargando ? '—' : disponibles}</b><span>Con stock</span></div>
        <div className="stat"><b>24/7</b><span>Tienda abierta</span></div>
      </section>

      {esAdmin && (
        <section className="admin-panel">
          <div>
            <h3>Panel de administración</h3>
            <p>Gestiona el catálogo y las cuentas de la tienda.</p>
          </div>
          <div className="hero-actions">
            <Link to="/productos?nuevo=1" className="btn-neon">+ Nuevo producto</Link>
            <Link to="/usuarios" className="btn-ghost btn-lg">Usuarios</Link>
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>DESTACADOS</h2>
          <Link to="/productos" className="link-neon">Ver todo →</Link>
        </div>
        {cargando ? (
          <div className="cargando">Cargando productos...</div>
        ) : destacados.length ? (
          <div className="grid">
            {destacados.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        ) : (
          <div className="vacio">
            <p>Aún no hay productos disponibles.</p>
            {esAdmin && <Link to="/productos?nuevo=1" className="btn-neon">Crear el primero</Link>}
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature"><h3>Catálogo al día</h3><p>Precios y stock actualizados en tiempo real.</p></div>
        <div className="feature"><h3>Cuenta segura</h3><p>Acceso con contraseña cifrada y token JWT.</p></div>
        <div className="feature"><h3>Seguimiento</h3><p>Revisa el estado de cada pedido desde tu cuenta.</p></div>
      </section>
    </div>
  )
}
