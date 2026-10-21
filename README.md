# Deport API

API REST para la gestion de torneos y eventos deportivos, desarrollada para el curso de Backend II de Coderhouse.

## Tematica

Deport es una plataforma pensada para la organizacion de torneos y eventos deportivos (futbol, padel, running, crossfit, entre otros). Permite gestionar las publicaciones de cada evento, fechas de realizacion, sedes, modalidades y el control de cupos para los participantes.

En esta primera etapa se implementa la arquitectura base en capas (rutas, controladores, servicios, repositorios, dao y modelos), dejando configurado el servidor con Express en formato ESM y variables de entorno.

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

Crear un archivo `.env` en la raiz tomando como plantilla el archivo `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/deport_db
JWT_SECRET=coderSecretTokenKey2026
```

## Instalacion y ejecucion

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en desarrollo:
```bash
npm run dev
```

3. Ejecutar en produccion:
```bash
npm start
```

## Endpoints disponibles

- `GET /api/health` - Estado del servidor (devuelve `{ "status": "ok", "message": "Servidor activo" }`)
- `GET /api/events` - Listado inicial de eventos (devuelve `{ "status": "success", "payload": [] }`)
- `POST /api/sessions/register` - Estructura base para registro
- `POST /api/sessions/login` - Estructura base para inicio de sesion
- `GET /api/sessions/current` - Estructura base para sesion actual
