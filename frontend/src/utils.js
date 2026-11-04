export const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`

export const fecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

export const iniciales = (texto = '') =>
  texto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
