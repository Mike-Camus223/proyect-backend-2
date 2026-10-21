# Deport API

API REST para la gestion de torneos y eventos deportivos.

## Tematica

Deport es una plataforma pensada para la organizacion de torneos y eventos deportivos (futbol, padel, running, crossfit, entre otros). Permite gestionar las publicaciones de cada evento, fechas de realizacion, sedes, modalidades y el control de cupos para los participantes.

## Tecnologias

- Node.js
- Express
- Mongoose
- Bcrypt
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
    ├── customResponse.util.js
    └── hash.js
```

## Endpoints disponibles

- `GET /api/health` - Estado del servidor
- `GET /api/events` - Listado de eventos
- `POST /api/sessions/register` - Registro de usuario
- `POST /api/sessions/login` - Inicio de sesion
- `GET /api/sessions/current` - Sesion actual
