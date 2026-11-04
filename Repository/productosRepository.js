const { isValidObjectId } = require('mongoose');
const Producto = require('../models/producto');

const getAll = () => Producto.find().sort({ createdAt: -1 });

const getById = (id) => (isValidObjectId(id) ? Producto.findById(id) : null);

// Convierte enlaces de Google Imágenes (google.com/imgres?imgurl=...) en la URL real de la imagen
const limpiarImagen = (datos) => {
  if (typeof datos.imagen !== 'string') return datos;
  let imagen = datos.imagen.trim();
  try {
    const u = new URL(imagen);
    if (u.hostname.includes('google.') && u.searchParams.get('imgurl')) imagen = u.searchParams.get('imgurl');
  } catch {
    // No es una URL válida: se guarda tal cual
  }
  return { ...datos, imagen };
};

const create = (producto) => Producto.create(limpiarImagen(producto));

const update = (id, datos) =>
  isValidObjectId(id)
    ? Producto.findByIdAndUpdate(id, limpiarImagen(datos), { new: true, runValidators: true })
    : null;

const remove = (id) => (isValidObjectId(id) ? Producto.findByIdAndDelete(id) : null);

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};
