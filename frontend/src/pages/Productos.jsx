import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api, { mensajeError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'

export default function Productos() {
  const { esAdmin } = useAuth()
  const aviso = useToast()
  const [params, setParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  const [soloStock, setSoloStock] = useState(false)
  const categoria = params.get('categoria') || 'Todas'

  useEffect(() => {
    api
      .get('/productos')
      .then((res) => setProductos(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudieron cargar los productos'), 'error'))
      .finally(() => setCargando(false))
  }, [aviso])

  const categorias = useMemo(() => {
    const c = {}
    productos.forEach((p) => (c[p.categoria || 'General'] = (c[p.categoria || 'General'] || 0) + 1))
    return Object.entries(c).sort((a, b) => a[0].localeCompare(b[0]))
  }, [productos])

  const elegirCategoria = (c) => setParams(c === 'Todas' ? {} : { categoria: c }, { replace: true })

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const filtrados = productos.filter(
      (p) =>
        (categoria === 'Todas' || (p.categoria || 'General') === categoria) &&
        (!soloStock || p.stock > 0) &&
        (p.nombre.toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
    )
    if (orden === 'precio-asc') return [...filtrados].sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') return [...filtrados].sort((a, b) => b.precio - a.precio)
    if (orden === 'nombre') return [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre))
    return filtrados
  }, [productos, busqueda, orden, categoria, soloStock])

  return (
    <div className="page">
      <div className="section-head">
        <h2 className="page-title">CATÁLOGO <span>/{lista.length}</span></h2>
        {esAdmin && <Link to="/admin/productos" className="btn-ghost btn-lg">Gestionar productos</Link>}
      </div>

      {categorias.length > 0 && (
        <div className="chips">
          <button className={`chip ${categoria === 'Todas' ? 'activo' : ''}`} onClick={() => elegirCategoria('Todas')}>
            Todas <span>{productos.length}</span>
          </button>
          {categorias.map(([c, n]) => (
            <button key={c} className={`chip ${categoria === c ? 'activo' : ''}`} onClick={() => elegirCategoria(c)}>
              {c} <span>{n}</span>
            </button>
          ))}
        </div>
      )}

      <div className="toolbar">
        <input
          className="input"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="input" value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="recientes">Más recientes</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre (A-Z)</option>
        </select>
        <label className="check">
          <input type="checkbox" checked={soloStock} onChange={(e) => setSoloStock(e.target.checked)} />
          Solo con stock
        </label>
      </div>

      {cargando ? (
        <div className="cargando">Cargando productos...</div>
      ) : lista.length ? (
        <div className="grid">
          {lista.map((p) => <ProductCard key={p.id} producto={p} />)}
        </div>
      ) : (
        <div className="vacio">
          <p>{productos.length ? 'Ningún producto coincide con tu búsqueda.' : 'Todavía no hay productos.'}</p>
          {esAdmin && !productos.length && <Link to="/admin/productos?nuevo=1" className="btn-neon">Crear el primero</Link>}
        </div>
      )}
    </div>
  )
}
