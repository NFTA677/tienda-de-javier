import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { mensajeError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'
import ProductoForm from '../components/ProductoForm'

export default function Productos() {
  const { esAdmin } = useAuth()
  const aviso = useToast()
  const [params, setParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  // null = cerrado, {} = nuevo, producto = editar
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    api
      .get('/productos')
      .then((res) => setProductos(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudieron cargar los productos'), 'error'))
      .finally(() => setCargando(false))
  }, [aviso])

  // Abre el formulario si se llega con ?nuevo=1 (desde Inicio)
  useEffect(() => {
    if (esAdmin && params.get('nuevo')) {
      setEditando({})
      setParams({}, { replace: true })
    }
  }, [esAdmin, params, setParams])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const filtrados = productos.filter(
      (p) => p.nombre.toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q)
    )
    if (orden === 'precio-asc') return [...filtrados].sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') return [...filtrados].sort((a, b) => b.precio - a.precio)
    if (orden === 'nombre') return [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre))
    return filtrados
  }, [productos, busqueda, orden])

  const guardado = (p) => {
    setProductos((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]))
    setEditando(null)
  }

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/productos/${p.id}`)
      setProductos((prev) => prev.filter((x) => x.id !== p.id))
      aviso('Producto eliminado')
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo eliminar'), 'error')
    }
  }

  return (
    <div className="page">
      <div className="section-head">
        <h2 className="page-title">CATÁLOGO <span>/{productos.length}</span></h2>
        {esAdmin && <button className="btn-neon" onClick={() => setEditando({})}>+ Nuevo producto</button>}
      </div>

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
      </div>

      {cargando ? (
        <div className="cargando">Cargando productos...</div>
      ) : lista.length ? (
        <div className="grid">
          {lista.map((p) => (
            <ProductCard key={p.id} producto={p} onEditar={setEditando} onEliminar={eliminar} />
          ))}
        </div>
      ) : (
        <div className="vacio">
          <p>{productos.length ? 'Ningún producto coincide con tu búsqueda.' : 'Todavía no hay productos.'}</p>
          {esAdmin && !productos.length && (
            <button className="btn-neon" onClick={() => setEditando({})}>Crear el primero</button>
          )}
        </div>
      )}

      {editando && (
        <ProductoForm
          producto={editando.id ? editando : null}
          onCerrar={() => setEditando(null)}
          onGuardado={guardado}
        />
      )}
    </div>
  )
}
