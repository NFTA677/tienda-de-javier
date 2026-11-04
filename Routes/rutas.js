const express = require('express');
const productosController = require('../Controllers/productosController');
const usuariosController = require('../Controllers/usuariosController');
const { register, login, me } = require('../Controllers/authController');
const authMiddleware = require('../Middlewares/authMiddleware');
const isAdmin = require('../Middlewares/isAdmin');
const pedidosRoutes = require('./pedidos');

const router = express.Router();

router.use('/pedidos', pedidosRoutes);

// Autenticación
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, me);

// Productos: ver es público, modificar solo admin
router.get('/productos', productosController.listar);
router.get('/productos/:id', productosController.obtenerUno);
router.post('/productos', authMiddleware, isAdmin, productosController.crear);
router.put('/productos/:id', authMiddleware, isAdmin, productosController.actualizar);
router.delete('/productos/:id', authMiddleware, isAdmin, productosController.eliminar);

// Usuarios: solo admin
router.get('/usuarios', authMiddleware, isAdmin, usuariosController.listar);
router.put('/usuarios/:id/rol', authMiddleware, isAdmin, usuariosController.cambiarRol);
router.delete('/usuarios/:id', authMiddleware, isAdmin, usuariosController.eliminar);

// Cualquier otra ruta de la API
router.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = router;
