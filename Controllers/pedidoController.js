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
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({ msg: 'Cantidad inválida' });
      }
      const prod = isValidObjectId(item.productoId) ? await Producto.findById(item.productoId) : null;
      if (!prod) return res.status(404).json({ msg: `Producto ${item.productoId} no existe` });
      if (prod.stock < cantidad) {
        return res.status(400).json({ msg: `Stock insuficiente de "${prod.nombre}" (quedan ${prod.stock})` });
      }
      total += prod.precio * cantidad;
      detalles.push({ producto: prod._id, cantidad, precioUnitario: prod.precio });
    }

    // Descuenta stock solo si sigue alcanzando; si algo falla, devuelve lo ya descontado
    const descontados = [];
    for (const d of detalles) {
      const r = await Producto.updateOne(
        { _id: d.producto, stock: { $gte: d.cantidad } },
        { $inc: { stock: -d.cantidad } }
      );
      if (r.modifiedCount === 0) {
        for (const x of descontados) {
          await Producto.updateOne({ _id: x.producto }, { $inc: { stock: x.cantidad } });
        }
        return res.status(409).json({ msg: 'El stock cambió, vuelve a intentarlo' });
      }
      descontados.push(d);
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
  const pedidos = await Pedido.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('detalles.producto');
  res.json(pedidos);
};

module.exports = { crearPedido, misPedidos };
