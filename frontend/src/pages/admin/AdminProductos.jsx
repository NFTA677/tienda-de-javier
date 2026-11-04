import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { mensajeError } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import ProductoForm from '../../components/ProductoForm'
import { iniciales, soles } from '../../utils'

export default function AdminProductos() {
  const aviso = useToast()
  const [params, setParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  // null = cerrado, {} = nuevo, producto = editar
  const [editando, setEditando] = useState(() => (params.get('nuevo') ? {} : null))

  useEffect(() => {
    if (params.get('nuevo')) setParams({}, { replace: true })
  }, [params, setParams])

  useEffect(() => {
    api
      .get('/productos')
      .then((res) => setProductos(res.data))
      .catch((e) => aviso(mensajeError(e, 'No se pudieron cargar los productos'), 'error'))
      .finally(() => setCargando(false))
  }, [aviso])

  const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria || 'General'))].sort(), [productos])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter((p) => p.nombre.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q))
  }, [productos, busqueda])

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
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>Productos</h1>
          <p className="muted">{productos.length} productos en {categorias.length} categorías.</p>
        </div>
        <button className="btn-neon" onClick={() => setEditando({})}>+ Nuevo producto</button>
      </header>

      <input
        className="input"
        placeholder="Buscar por nombre o categoría..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <div className="cargando">Cargando productos...</div>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="user-cell">
                      <span className="mini-thumb">
                        {p.imagen ? <img src={p.imagen} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                        {iniciales(p.nombre)}
                      </span>
                      <div>
                        <b>{p.nombre}</b>
                        <span className="muted recorte">{p.descripcion || 'Sin descripción'}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge">{p.categoria || 'General'}</span></td>
                  <td><b>{soles(p.precio)}</b></td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-amber' : ''}`}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} u.`}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-ghost" onClick={() => setEditando(p)}>Editar</button>
                      <button className="btn-ghost btn-danger" onClick={() => eliminar(p)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!lista.length && (
                <tr>
                  <td colSpan={5} className="muted centro">
                    {productos.length ? 'Ningún producto coincide.' : 'Todavía no hay productos. Crea el primero.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <ProductoForm
          producto={editando.id ? editando : null}
          categorias={categorias}
          onCerrar={() => setEditando(null)}
          onGuardado={guardado}
        />
      )}
    </div>
  )
}
