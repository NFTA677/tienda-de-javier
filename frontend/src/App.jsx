import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import Navbar, { Marca } from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import AdminLayout from './components/AdminLayout'
import Inicio from './pages/Inicio'
import Productos from './pages/Productos'
import Carrito from './pages/Carrito'
import MisPedidos from './pages/MisPedidos'
import Login from './pages/Login'
import Resumen from './pages/admin/Resumen'
import AdminPedidos from './pages/admin/AdminPedidos'
import AdminProductos from './pages/admin/AdminProductos'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import './App.css'
import './admin.css'

function NoEncontrado() {
  return (
    <div className="page vacio">
      <h2>Página no encontrada</h2>
      <Link to="/" className="btn-neon">Volver al inicio</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="app-dark">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/carrito" element={<Carrito />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Login modo="registro" />} />
                  <Route path="/pedidos" element={<RutaProtegida><MisPedidos /></RutaProtegida>} />

                  <Route path="/admin" element={<RutaProtegida soloAdmin><AdminLayout /></RutaProtegida>}>
                    <Route index element={<Resumen />} />
                    <Route path="pedidos" element={<AdminPedidos />} />
                    <Route path="productos" element={<AdminProductos />} />
                    <Route path="usuarios" element={<AdminUsuarios />} />
                  </Route>
                  <Route path="/usuarios" element={<Navigate to="/admin/usuarios" replace />} />

                  <Route path="*" element={<NoEncontrado />} />
                </Routes>
              </main>
              <footer className="footer">
                <div className="footer-cols">
                  <div>
                    <span className="logo"><Marca /></span>
                    <p className="muted">Tu tienda en línea. Compra fácil y sigue tus pedidos.</p>
                  </div>
                  <nav>
                    <b>Tienda</b>
                    <Link to="/">Inicio</Link>
                    <Link to="/productos">Productos</Link>
                    <Link to="/carrito">Carrito</Link>
                  </nav>
                  <nav>
                    <b>Mi cuenta</b>
                    <Link to="/pedidos">Mis pedidos</Link>
                    <Link to="/login">Entrar</Link>
                    <Link to="/registro">Crear cuenta</Link>
                  </nav>
                </div>
                <p className="footer-copy">© {new Date().getFullYear()} hackeame.pe · Todos los derechos reservados</p>
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
