# hackeame.pe — Tienda fullstack

Tienda en línea con **React** (frontend), **Node.js + Express** (API REST y servicio SOAP) y **MongoDB**.
Publicada en Render: https://hackeame.pe.nfta-corp.uk

## Estructura

```
├── index.js              Servidor Express (API REST, SOAP y frontend compilado)
├── Config/database.js    Conexión a MongoDB con Mongoose
├── models/               Esquemas: User, Producto, Pedido
├── Controllers/          Lógica de cada recurso (+ soapController.js)
├── Routes/               Rutas REST bajo /api
├── Middlewares/          Autenticación JWT y rol admin
├── Repository/           Acceso a datos de productos
├── frontend/             React + Vite + React Router
├── Dockerfile            Imagen de la aplicación (2 etapas)
└── docker-compose.yml    App + MongoDB en contenedores
```

## Ejecutar en local (sin Docker)

1. Crea `.env` a partir de `.env.example` (necesitas `MONGODB_URI` y `JWT_SECRET`).
2. Backend: `npm install` y `npm start` → http://localhost:3000
3. Frontend en modo desarrollo: `cd frontend`, `npm install` y `npm run dev` → http://localhost:5173

## Ejecutar con Docker

```bash
docker compose up --build
```

Levanta dos contenedores: `app` (la tienda) y `mongo` (MongoDB 7 con un volumen para los datos).
Abre http://localhost:3000.

## API REST (JSON) — bajo `/api`

| Método | Ruta | Acceso |
|---|---|---|
| POST | /auth/register, /auth/login | Público |
| GET | /auth/me | Con sesión |
| GET | /productos, /productos/:id | Público |
| POST, PUT, DELETE | /productos, /productos/:id | Admin |
| POST | /pedidos · GET /pedidos/mios | Con sesión |
| GET | /pedidos · PUT /pedidos/:id/estado | Admin |
| GET | /admin/resumen, /usuarios | Admin |
| PUT, DELETE | /usuarios/:id/rol, /usuarios/:id | Admin |

Las rutas privadas usan el encabezado `Authorization: Bearer <token>`.

## Servicio SOAP (XML) — `/soap`

- Contrato: `GET /soap?wsdl`
- Operaciones: `ListarProductos` y `ObtenerProducto`

Ejemplo:

```bash
curl -X POST http://localhost:3000/soap -H "Content-Type: text/xml" -d '
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:hackeame:tienda">
  <soap:Body><tns:ListarProductos/></soap:Body>
</soap:Envelope>'
```
