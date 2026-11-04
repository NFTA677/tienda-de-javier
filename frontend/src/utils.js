export const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`

export const fecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

// Si pegan un enlace de Google Imágenes (google.com/imgres?...imgurl=...), extrae la imagen real
export const limpiarUrlImagen = (url = '') => {
  const texto = url.trim()
  try {
    const u = new URL(texto)
    const real = u.hostname.includes('google.') && u.searchParams.get('imgurl')
    return real || texto
  } catch {
    return texto
  }
}

export const iniciales = (texto = '') =>
  texto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
