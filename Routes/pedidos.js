const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');
const { crearPedido, misPedidos } = require('../Controllers/pedidoController');

router.post('/', auth, crearPedido);
router.get('/mios', auth, misPedidos);

module.exports = router;