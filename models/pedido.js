const { Schema, model } = require('mongoose');

// Los detalles del pedido van embebidos (reemplaza la tabla DetallePedido)
const detalleSchema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true },
});

const pedidoSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    total: { type: Number, required: true },
    estado: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' },
    detalles: [detalleSchema],
  },
  { timestamps: true }
);

module.exports = model('Pedido', pedidoSchema);
