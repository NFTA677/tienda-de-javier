import { useState } from 'react'
import api, { mensajeError } from '../services/api'
import { useToast } from '../context/ToastContext'
import { limpiarUrlImagen } from '../utils'

const vacio = { nombre: '', descripcion: '', precio: '', stock: '', imagen: '' }

// Modal para crear o editar un producto (solo admin)
export default function ProductoForm({ producto, onCerrar, onGuardado }) {
  const editando = Boolean(producto)
  const [form, setForm] = useState(() =>
    editando
      ? {
          nombre: producto.nombre,
          descripcion: producto.descripcion || '',
          precio: String(producto.precio),
          stock: String(producto.stock),
          imagen: producto.imagen || '',
        }
      : vacio
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [imagenRota, setImagenRota] = useState(false)
  const aviso = useToast()

  const cambiar = (e) => {
    const { name, value } = e.target
    if (name === 'imagen') setImagenRota(false)
    setForm({ ...form, [name]: name === 'imagen' ? limpiarUrlImagen(value) : value })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    const datos = {
      ...form,
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock || 0),
    }
    if (!datos.nombre) return setError('El nombre es obligatorio')
    if (!(datos.precio >= 0)) return setError('El precio debe ser un número válido')
    if (!Number.isInteger(datos.stock) || datos.stock < 0) return setError('El stock debe ser un entero mayor o igual a 0')

    try {
      setGuardando(true)
      const res = editando ? await api.put(`/productos/${producto.id}`, datos) : await api.post('/productos', datos)
      aviso(editando ? 'Producto actualizado' : 'Producto creado')
      onGuardado(res.data)
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el producto'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={guardar}>
        <h2>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>

        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} autoFocus required />
        </label>
        <label>
          Descripción
          <textarea name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} />
        </label>
        <div className="form-row">
          <label>
            Precio (S/)
            <input name="precio" type="number" step="0.01" min="0" value={form.precio} onChange={cambiar} required />
          </label>
          <label>
            Stock
            <input name="stock" type="number" step="1" min="0" value={form.stock} onChange={cambiar} />
          </label>
        </div>
        <label>
          URL de imagen (opcional)
          <input name="imagen" type="url" value={form.imagen} onChange={cambiar} placeholder="https://..." />
        </label>
        {form.imagen && !imagenRota && (
          <img className="preview-img" src={form.imagen} alt="Vista previa" onError={() => setImagenRota(true)} />
        )}
        {imagenRota && (
          <p className="form-aviso">
            Ese enlace no es una imagen. En Google Imágenes, abre la imagen, haz clic derecho sobre ella y
            elige <b>"Copiar dirección de imagen"</b>.
          </p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn-neon" disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
