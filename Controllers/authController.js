const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
  const { nombre, email, password } = req.body;
  const existe = await User.findOne({ email });
  if (existe) return res.status(409).json({ error: 'Email ya registrado' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ nombre, email, password: hash });
  res.status(201).json({ id: user.id, email: user.email });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};
module.exports = { register, login };