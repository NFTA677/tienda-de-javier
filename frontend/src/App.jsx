import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Productos from './pages/Productos'
import Carrito from './pages/Carrito'
import MisPedidos from './pages/MisPedidos'
import Usuarios from './pages/Usuarios'
import Login from './pages/Login'
import './App.css'

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
                  <Route path="/usuarios" element={<RutaProtegida soloAdmin><Usuarios /></RutaProtegida>} />
                  <Route path="*" element={<NoEncontrado />} />
                </Routes>
              </main>
              <footer className="footer">
                FULSTAK<span>.</span> · Tienda fullstack con React, Express y MongoDB
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
