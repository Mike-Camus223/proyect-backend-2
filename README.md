# Plataforma de Eventos - API

Backend para la plataforma de gestion de eventos e inscripciones (Backend II - Coderhouse).

## Descripcion

API REST organizada por capas para la administracion de eventos y registro de usuarios. En esta primera entrega se deja lista la estructura base del servidor con Express (ESM), conexion configurada mediante variables de entorno y las rutas iniciales.

## Tecnologias

- Node.js
- Express
- Mongoose
- Dotenv
- Nodemon

## Estructura de carpetas

```text
src/
├── app.js
├── server.js
├── config/
│   └── env.config.js
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── services/
│   ├── events.service.js
│   └── sessions.service.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
├── middlewares/
│   └── errorHandler.middleware.js
└── utils/
    └── customResponse.util.js
```

## Variables de entorno

Crear un archivo `.env` en la raiz con los siguientes valores de ejemplo:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/eventos_db
JWT_SECRET=coderSecretTokenKey2026
```

## Instalacion y ejecucion

Instalar las dependencias:
```bash
npm install
```

Ejecutar en desarrollo:
```bash
npm run dev
```

Ejecutar en produccion:
```bash
npm start
```

## Rutas disponibles

- `GET /api/health` - Estado del servidor (devuelve `{ status: "ok", message: "Servidor activo" }`)
- `GET /api/events` - Listado inicial de eventos (devuelve `{ status: "success", payload: [] }`)
- `POST /api/sessions/register` - Registro de usuario
- `POST /api/sessions/login` - Inicio de sesion
- `GET /api/sessions/current` - Datos de sesion actual
