const { isValidObjectId } = require('mongoose');
const { User, Pedido } = require('../models');

const listar = async (req, res) => {
  const usuarios = await User.find().select('-password').sort({ createdAt: -1 }).lean();
  const conteos = await Pedido.aggregate([
    { $group: { _id: '$user', pedidos: { $sum: 1 }, gastado: { $sum: '$total' } } },
  ]);
  const porUsuario = Object.fromEntries(conteos.map((c) => [String(c._id), c]));

  res.json(
    usuarios.map((u) => ({
      id: String(u._id),
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      createdAt: u.createdAt,
      pedidos: porUsuario[String(u._id)]?.pedidos || 0,
      gastado: porUsuario[String(u._id)]?.gastado || 0,
    }))
  );
};

const cambiarRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  if (!['admin', 'cliente'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  if (!isValidObjectId(id)) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (id === req.user.id) return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });

  const user = await User.findByIdAndUpdate(id, { rol }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (id === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });

  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  await Pedido.deleteMany({ user: id });
  res.json({ mensaje: 'Usuario eliminado correctamente.' });
};

module.exports = { listar, cambiarRol, eliminar };
