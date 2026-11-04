const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');
const isAdmin = require('../Middlewares/isAdmin');
const { crearPedido, misPedidos } = require('../Controllers/pedidoController');
const { listarPedidos, cambiarEstado } = require('../Controllers/adminController');

// Clientes
router.post('/', auth, crearPedido);
router.get('/mios', auth, misPedidos);

// Admin: pedidos de todos los clientes
router.get('/', auth, isAdmin, listarPedidos);
router.put('/:id/estado', auth, isAdmin, cambiarEstado);

module.exports = router;
