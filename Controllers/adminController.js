const { isValidObjectId } = require('mongoose');
const { Pedido, Producto, User } = require('../models');

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const STOCK_BAJO = 5;

// Resumen para el panel de administración
const resumen = async (req, res) => {
  const [productos, usuarios, pedidos, ventas, porEstado, stockBajo, recientes] = await Promise.all([
    Producto.countDocuments(),
    User.countDocuments(),
    Pedido.countDocuments(),
    Pedido.aggregate([
      { $match: { estado: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Pedido.aggregate([{ $group: { _id: '$estado', cantidad: { $sum: 1 } } }]),
    Producto.find({ stock: { $lte: STOCK_BAJO } }).sort({ stock: 1 }).limit(8),
    Pedido.find().sort({ createdAt: -1 }).limit(6).populate('user', 'nombre email'),
  ]);

  const estados = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  porEstado.forEach((e) => (estados[e._id] = e.cantidad));

  res.json({
    productos,
    usuarios,
    pedidos,
    ventas: ventas[0]?.total || 0,
    estados,
    stockBajo,
    recientes,
  });
};

// Todos los pedidos de todos los clientes
const listarPedidos = async (req, res) => {
  const pedidos = await Pedido.find()
    .sort({ createdAt: -1 })
    .populate('user', 'nombre email')
    .populate('detalles.producto', 'nombre imagen');
  res.json(pedidos);
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
  if (!isValidObjectId(id)) return res.status(404).json({ error: 'Pedido no encontrado' });

  const pedido = await Pedido.findById(id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  if (pedido.estado === 'cancelado') {
    return res.status(400).json({ error: 'Un pedido cancelado ya no se puede modificar' });
  }

  // Al cancelar, se devuelve el stock de los productos
  if (estado === 'cancelado') {
    for (const d of pedido.detalles) {
      await Producto.updateOne({ _id: d.producto }, { $inc: { stock: d.cantidad } });
    }
  }

  pedido.estado = estado;
  await pedido.save();
  await pedido.populate([
    { path: 'user', select: 'nombre email' },
    { path: 'detalles.producto', select: 'nombre imagen' },
  ]);
  res.json(pedido);
};

module.exports = { resumen, listarPedidos, cambiarEstado };
