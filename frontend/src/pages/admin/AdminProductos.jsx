import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import api, { mensajeError } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import ProductoForm from '../../components/ProductoForm'
import Icon from '../../components/Icon'
import { iniciales, soles } from '../../utils'

export default function AdminProductos() {
  const aviso = useToast()
  const { recargarContadores } = useOutletContext()
  const [params, setParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
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

  const conteo = useMemo(
    () => ({
      todos: productos.length,
      disponibles: productos.filter((p) => p.stock > 5).length,
      bajo: productos.filter((p) => p.stock > 0 && p.stock <= 5).length,
      agotados: productos.filter((p) => p.stock === 0).length,
    }),
    [productos]
  )

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter(
      (p) =>
        (filtro === 'todos' ||
          (filtro === 'disponibles' && p.stock > 5) ||
          (filtro === 'bajo' && p.stock > 0 && p.stock <= 5) ||
          (filtro === 'agotados' && p.stock === 0)) &&
        (p.nombre.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q))
    )
  }, [productos, busqueda, filtro])

  const guardado = (p) => {
    setProductos((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]))
    setEditando(null)
    recargarContadores()
  }

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/productos/${p.id}`)
      setProductos((prev) => prev.filter((x) => x.id !== p.id))
      recargarContadores()
      aviso('Producto eliminado')
    } catch (e) {
      aviso(mensajeError(e, 'No se pudo eliminar'), 'error')
    }
  }

  const filtros = [
    ['todos', 'Todos', ''],
    ['disponibles', 'Disponibles', 'entregado'],
    ['bajo', 'Stock bajo', 'pendiente'],
    ['agotados', 'Agotados', 'cancelado'],
  ]

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Productos</h1>
          <p>{productos.length} productos en {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}.</p>
        </div>
        <button className="btn-neon" onClick={() => setEditando({})}><Icon nombre="mas" size={16} /> Nuevo producto</button>
      </header>

      <section className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="tablist">
            {filtros.map(([k, label, dot]) => (
              <button key={k} role="tab" aria-selected={filtro === k} className={filtro === k ? 'activo' : ''} onClick={() => setFiltro(k)}>
                {dot && <i className={`dot dot-${dot}`} />}
                {label}
                <span>{conteo[k]}</span>
              </button>
            ))}
          </div>
          <label className="search">
            <Icon nombre="buscar" size={16} />
            <input placeholder="Buscar nombre o categoría" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>
        </div>

        {cargando ? (
          <div className="cargando">Cargando productos...</div>
        ) : lista.length ? (
          <div className="tabla-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="der">Precio</th>
                  <th>Stock</th>
                  <th className="der">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => {
                  const nivel = p.stock === 0 ? 'cancelado' : p.stock <= 5 ? 'pendiente' : 'entregado'
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="persona">
                          <span className="thumb thumb-lg">
                            {p.imagen ? <img src={p.imagen} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                            {iniciales(p.nombre)}
                          </span>
                          <div>
                            <b>{p.nombre}</b>
                            <small className="recorte">{p.descripcion || 'Sin descripción'}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag">{p.categoria || 'General'}</span></td>
                      <td className="der"><b className="monto">{soles(p.precio)}</b></td>
                      <td>
                        <span className={`estado estado-${nivel}`}>
                          <i className={`dot dot-${nivel}`} />
                          {p.stock === 0 ? 'Agotado' : `${p.stock} unidades`}
                        </span>
                      </td>
                      <td className="der">
                        <div className="acciones">
                          <button className="icon-btn" onClick={() => setEditando(p)} aria-label={`Editar ${p.nombre}`} title="Editar">
                            <Icon nombre="editar" size={16} />
                          </button>
                          <button className="icon-btn peligro" onClick={() => eliminar(p)} aria-label={`Eliminar ${p.nombre}`} title="Eliminar">
                            <Icon nombre="borrar" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="adm-empty">
            <Icon nombre="productos" size={28} />
            <b>{productos.length ? 'Ningún producto coincide' : 'Todavía no hay productos'}</b>
            {!productos.length && <button className="btn-neon" onClick={() => setEditando({})}>Crear el primero</button>}
          </div>
        )}
      </section>

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
