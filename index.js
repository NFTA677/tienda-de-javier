require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const conectarDB = require('./Config/database');
const rutas = require('./Routes/rutas');
const soap = require('./Controllers/soapController');

const app = express();
const port = process.env.PORT || 3000;

// FRONTEND_URL admite varias URLs separadas por coma
const origenes = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(cors({ origin: origenes, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// API REST (JSON)
app.use('/api', rutas);

// Servicio SOAP (XML): GET /soap?wsdl para el contrato, POST /soap para las operaciones
app.get('/soap', soap.contrato);
app.post('/soap', express.text({ type: () => true }), soap.atender);

// Sirve el frontend compilado (frontend/dist) desde el mismo servidor
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('/{*ruta}', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));

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
