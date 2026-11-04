import { createContext, useContext, useEffect, useState } from 'react'

const CART_KEY = 'fulstak_carrito'
const CartContext = createContext(null)

const leerCarrito = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leerCarrito)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      // Sin almacenamiento disponible: el carrito vive solo en memoria
    }
  }, [items])

  const agregar = (p) =>
    setItems((prev) => {
      const existe = prev.find((i) => i.id === p.id)
      if (existe) {
        return prev.map((i) => (i.id === p.id ? { ...i, cantidad: Math.min(i.cantidad + 1, p.stock) } : i))
      }
      const { id, nombre, precio, imagen, stock } = p
      return [...prev, { id, nombre, precio, imagen, stock, cantidad: 1 }]
    })

  const cambiarCantidad = (id, cantidad) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) } : i))
    )

  const quitar = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const vaciar = () => setItems([])

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, agregar, cambiarCantidad, quitar, vaciar, total, cantidadTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
