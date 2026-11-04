import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { mensajeError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import hero from '../assets/hero.png'

// Sirve para "Entrar" y "Crear cuenta"
export default function Login({ modo = 'login' }) {
  const esRegistro = modo === 'registro'
  const { user, login, registro } = useAuth()
  const aviso = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const siguiente = params.get('next') || '/'

  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (user) return <Navigate to={siguiente} replace />

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setCargando(true)
      const u = esRegistro ? await registro(form) : await login(form.email, form.password)
      aviso(esRegistro ? `¡Bienvenido, ${u.nombre}!` : `Hola de nuevo, ${u.nombre}`)
      navigate(siguiente, { replace: true })
    } catch (err) {
      setError(mensajeError(err, 'No se pudo conectar con el servidor'))
    } finally {
      setCargando(false)
    }
  }

  const sufijo = params.get('next') ? `?next=${encodeURIComponent(siguiente)}` : ''

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={enviar}>
        <img src={hero} alt="" className="hero-img" />
        <h1>{esRegistro ? 'Crea tu cuenta' : 'Entra a la tienda'}</h1>
        <p className="subtitle">
          {esRegistro ? 'Regístrate para comprar y seguir tus pedidos.' : 'Inicia sesión con tu email y contraseña.'}
        </p>

        {esRegistro && (
          <input name="nombre" value={form.nombre} onChange={cambiar} placeholder="Nombre completo" required autoComplete="name" />
        )}
        <input name="email" type="email" value={form.email} onChange={cambiar} placeholder="Email" required autoComplete="email" />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={cambiar}
          placeholder={esRegistro ? 'Contraseña (mín. 6 caracteres)' : 'Contraseña'}
          minLength={esRegistro ? 6 : undefined}
          required
          autoComplete={esRegistro ? 'new-password' : 'current-password'}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-neon" disabled={cargando}>
          {cargando ? 'Verificando...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
        </button>

        <p className="muted centro">
          {esRegistro ? (
            <>¿Ya tienes cuenta? <Link to={`/login${sufijo}`} className="link-neon">Inicia sesión</Link></>
          ) : (
            <>¿No tienes cuenta? <Link to={`/registro${sufijo}`} className="link-neon">Regístrate</Link></>
          )}
        </p>
      </form>
    </div>
  )
}
