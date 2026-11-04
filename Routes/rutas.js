const express = require('express');
const productosController = require('../Controllers/productosController');
const { register, login } = require('../Controllers/authController');
const authMiddleware = require('../Middlewares/authMiddleware');
const isAdmin = require('../Middlewares/isAdmin');
const router = express.Router();
const pedidosRoutes = require('./pedidos');

router.use('/pedidos', pedidosRoutes);

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/productos', authMiddleware, productosController.listar);
router.post('/productos', authMiddleware, isAdmin, productosController.crear);
router.put('/productos/:id', authMiddleware, isAdmin, productosController.actualizar);
router.delete('/productos/:id', authMiddleware, isAdmin, productosController.eliminar);

module.exports = router;