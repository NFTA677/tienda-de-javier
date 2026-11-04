const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(401).json({ msg: 'Usuario no existe' });
    
    req.user = user; // Aquí ya viene con el rol
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token no valido' });
  }
};

module.exports = auth;