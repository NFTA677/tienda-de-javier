const { isValidObjectId } = require('mongoose');
const { Pedido, Producto } = require('../models');

const crearPedido = async (req, res) => {
  try {
    const { productos } = req.body; // Espera: [{ productoId: "<id>", cantidad: 2 }, ...]

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ msg: 'Carrito vacío' });
    }

    let total = 0;
    const detalles = [];
    for (const item of productos) {
      const prod = isValidObjectId(item.productoId) ? await Producto.findById(item.productoId) : null;
      if (!prod) return res.status(404).json({ msg: `Producto ${item.productoId} no existe` });
      total += prod.precio * item.cantidad;
      detalles.push({ producto: prod._id, cantidad: item.cantidad, precioUnitario: prod.precio });
    }

    const pedido = await Pedido.create({ user: req.user._id, total, estado: 'pendiente', detalles });

    res.status(201).json({ msg: 'Pedido creado', pedidoId: pedido.id, total });
  } catch (error) {
    console.error(error);
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ msg: 'Error al crear pedido' });
  }
};

const misPedidos = async (req, res) => {
  const pedidos = await Pedido.find({ user: req.user._id }).populate('detalles.producto');
  res.json(pedidos);
};

module.exports = { crearPedido, misPedidos };
