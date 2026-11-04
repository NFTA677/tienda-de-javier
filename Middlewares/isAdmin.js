const isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.rol === 'admin') {
      next();
    } else {
      return res.status(403).json({ msg: 'Acceso denegado: Se requiere rol de administrador' });
    }
  } catch (error) {
    return res.status(500).json({ msg: 'Error en validacion de rol' });
  }
};

module.exports = isAdmin;