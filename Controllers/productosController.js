const productosRepository = require('../Repository/productosRepository');

const listar = async (req, res) => {
  try {
    const productos = await productosRepository.getAll();
    res.json(productos);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'No se pudieron listar los productos.' });
  }
};

const obtenerUno = async (req, res) => {
  try {
    const producto = await productosRepository.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
};

const crear = async (req, res) => {
  try {
    const producto = await productosRepository.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await productosRepository.update(req.params.id, req.body);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const producto = await productosRepository.delete(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
};

module.exports = {
  listar,
  obtenerUno,
  crear,
  actualizar,
  eliminar,
};