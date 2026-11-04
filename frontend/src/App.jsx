import { useState, useEffect } from 'react'
import api from './services/api'
import hero from './assets/hero.png'
import './App.css'

function App() {
  const [email, setEmail] = useState('javier@fulstak.com')
  const [password, setPassword] = useState('123456')
  const [productos, setProductos] = useState([])
  const [token, setToken] = useState(sessionStorage.getItem('fulstak_token'))
  const [loading, setLoading] = useState(false)

  const login = async () => {
    try {
      setLoading(true)
      const res = await api.post('/auth/login', { email, password })
      const t = res.data.token
      // PUNTO 4: sessionStorage en vez de localStorage
      sessionStorage.setItem('fulstak_token', t)
      setToken(t)
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.response?.data?.msg || 'Credenciales inválidas'))
      console.log(e.response?.data)
    } finally { setLoading(false) }
  }

  const cargarProductos = async () => {
    try {
      // YA NO NECESITAS MANDAR EL HEADER MANUAL, LO HACE api.js
      const res = await api.get('/productos')
      setProductos(res.data)
    } catch(e) { console.log(e) }
  }

  useEffect(() => { if (token) cargarProductos() }, [token])

  const logout = () => {
    sessionStorage.removeItem('fulstak_token')
    setToken(null)
    setProductos([])
  }

  return (
    <div className="app-dark">
      <nav className="navbar">
        <div className="logo">FULSTAK<span>.</span><b>DARK</b></div>
        {token && <div className="nav-right"><span>{email}</span><button onClick={logout} className="btn-ghost">Salir</button></div>}
      </nav>

      {!token ? (
        <div className="login-wrapper">
          <div className="login-card">
            <img src={hero} alt="hero" className="hero-img" />
            <h1>Entra a la tienda</h1>
            <p className="subtitle">Punto 4: Bearer Token con interceptor</p>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
            <button onClick={login} className="btn-neon" disabled={loading}>{loading ? 'Verificando...' : 'Entrar con JWT'}</button>
            <code className="code-hint">sessionStorage + Authorization: Bearer token en cada request vía api.js</code>
          </div>
        </div>
      ) : (
        <div className="catalog">
          <h2>CATÁLOGO <span>/{productos.length}</span></h2>
          <div className="grid">
            {productos.map(p=> (
              <div key={p.id} className="product-card">
                <div className="product-img">
  {p.imagen ? (
    <img src={p.imagen} alt={p.nombre} style={{width:'100%', height:'140px', objectFit:'cover', borderRadius:'12px'}} />
  ) : (
    <div style={{width:'100%', height:'140px', display:'grid', placeItems:'center', background:'#2a2a2a', borderRadius:'12px', fontSize:'32px', fontWeight:'bold'}}>
      {p.nombre.slice(0,2).toUpperCase()}
    </div>
  )}
</div>
                <h3>{p.nombre}</h3>
                <p>{p.descripcion || 'Sin descripción'}</p>
                <div className="price-row"><span className="price">S/ {p.precio}</span><span className="stock">Stock {p.stock}</span></div>
                <button className="btn-white">Agregar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default App