const { Schema, model } = require('mongoose');

const productoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    precio: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    imagen: { type: String },
    categoria: { type: String, trim: true, default: 'General' },
  },
  { timestamps: true }
);

module.exports = model('Producto', productoSchema);
