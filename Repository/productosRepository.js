const { isValidObjectId } = require('mongoose');
const Producto = require('../models/producto');

const getAll = () => Producto.find().sort({ createdAt: -1 });

const getById = (id) => (isValidObjectId(id) ? Producto.findById(id) : null);

const create = (producto) => Producto.create(producto);

const update = (id, datos) =>
  isValidObjectId(id)
    ? Producto.findByIdAndUpdate(id, datos, { new: true, runValidators: true })
    : null;

const remove = (id) => (isValidObjectId(id) ? Producto.findByIdAndDelete(id) : null);

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};
