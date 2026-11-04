require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./Config/database');
const rutas = require('./Routes/rutas');

const app = express();
const port = process.env.PORT || 3000;

// FRONTEND_URL admite varias URLs separadas por coma
const origenes = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(cors({ origin: origenes, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/', rutas);

conectarDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`API Tienda escuchando en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exitCode = 1;
  });
